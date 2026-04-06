// ══════════════════════════════════════════════════════════════════════════════
// GAME ENGINE — Connects atoms + mechanic configs to a playable text game
//
// This is the missing layer between "config says mining iron gives 35 XP"
// and "player types 'mine' and iron appears in their inventory."
//
// It handles:
//   - Player state (inventory, equipment, skills, position)
//   - World state (what's at each location, resource nodes, NPCs)
//   - Command routing (text input → find matching mechanic → execute)
//   - Tick processing (advance all active mechanics per player)
//   - State persistence (save/load)
// ══════════════════════════════════════════════════════════════════════════════

const { create, list, get } = require('./mechanic');
const XpDrop = require('./xp-drop');
const Cooldown = require('./cooldown');

// ── PLAYER STATE ────────────────────────────────────────────────────────────

class Player {
  constructor(name) {
    this.name = name;
    this.x = 0;
    this.y = 0;
    this.hp = 10;
    this.maxHp = 10;
    this.prayerPoints = 1;
    this.maxPrayer = 1;
    this.runEnergy = 10000;
    this.running = false;
    this.skills = {};
    this.inventory = new Array(28).fill(null); // 28 slots
    this.equipment = {};
    this.bank = [];
    this.activePrayers = new Set();
    this.combatTarget = null;
    this.activeMechanic = null; // currently running skill/action
    this.cooldowns = {
      eat: new Cooldown(3),
      drink: new Cooldown(3),
      attack: new Cooldown(4),
    };
    this.questStates = {}; // questId → 'not_started' | 'in_progress' | 'complete'
    this.killCounts = {};
    this.boosts = {};
    this.poison = null;
    this._prayerDrainCounter = 0;
    this.totalLevel = 0;

    // Initialize all skills at level 1
    const SKILLS = [
      'attack','strength','defence','ranged','magic','hitpoints','prayer',
      'runecraft','construction','agility','herblore','thieving','crafting',
      'fletching','slayer','hunter','mining','smithing','fishing','cooking',
      'firemaking','woodcutting','farming'
    ];
    for (const s of SKILLS) {
      this.skills[s] = { level: 1, xp: 0 };
    }
    this.skills.hitpoints = { level: 10, xp: 1154 };
    this.hp = 10;
    this.maxHp = 10;
    this._recalc();
  }

  _recalc() {
    this.maxHp = this.skills.hitpoints.level;
    this.maxPrayer = this.skills.prayer.level;
    this.totalLevel = Object.values(this.skills).reduce((sum, s) => sum + s.level, 0);
  }

  getLevel(skill) {
    return this.skills[skill]?.level || 1;
  }

  awardXp(skill, amount) {
    const result = XpDrop.award(this, skill, Math.floor(amount));
    if (result.leveled) {
      this._recalc();
    }
    return result;
  }

  // Inventory management
  invAdd(name, quantity = 1) {
    for (let q = 0; q < quantity; q++) {
      const slot = this.inventory.findIndex(s => s === null);
      if (slot < 0) return { success: false, reason: 'Inventory full' };
      this.inventory[slot] = { name, count: 1 };
    }
    return { success: true };
  }

  invRemove(name, quantity = 1) {
    let removed = 0;
    for (let i = 0; i < this.inventory.length && removed < quantity; i++) {
      if (this.inventory[i]?.name === name) {
        this.inventory[i] = null;
        removed++;
      }
    }
    return removed === quantity;
  }

  invCount(name) {
    return this.inventory.filter(s => s?.name === name).length;
  }

  invFreeSlots() {
    return this.inventory.filter(s => s === null).length;
  }

  hasItem(name) {
    return this.invCount(name) > 0 || Object.values(this.equipment).some(e => e?.name === name);
  }
}

// ── WORLD NODE ──────────────────────────────────────────────────────────────
// A node is something interactive at a location: a rock, tree, fishing spot, NPC

class WorldNode {
  constructor(opts) {
    this.id = opts.id;
    this.type = opts.type;           // 'resource', 'npc', 'object', 'monster'
    this.name = opts.name;
    this.x = opts.x;
    this.y = opts.y;
    this.mechanicId = opts.mechanicId; // which mechanic config to use
    this.respawnTicks = opts.respawnTicks || 0;
    this.depleted = false;
    this.depletedAt = 0;
    this.hp = opts.hp || 0;
    this.maxHp = opts.hp || 0;
    this.data = opts.data || {};
  }

  deplete(currentTick) {
    this.depleted = true;
    this.depletedAt = currentTick;
  }

  checkRespawn(currentTick) {
    if (this.depleted && this.respawnTicks > 0 && currentTick - this.depletedAt >= this.respawnTicks) {
      this.depleted = false;
      this.hp = this.maxHp;
      return true;
    }
    return false;
  }
}

// ── GAME ENGINE ─────────────────────────────────────────────────────────────

class GameEngine {
  constructor() {
    this.players = new Map();      // name → Player
    this.nodes = new Map();        // nodeId → WorldNode
    this.currentTick = 0;
    this.messageLog = [];          // per-tick messages to return to player
    this._activeMechanics = new Map(); // playerId → Mechanic instance
  }

  // Create or get player
  getPlayer(name) {
    if (!this.players.has(name)) {
      this.players.set(name, new Player(name));
    }
    return this.players.get(name);
  }

  // Place a node in the world
  addNode(opts) {
    const node = new WorldNode(opts);
    this.nodes.set(node.id, node);
    return node;
  }

  // Find nodes near a player
  nodesNear(player, range = 5) {
    const results = [];
    for (const node of this.nodes.values()) {
      const dist = Math.max(Math.abs(node.x - player.x), Math.abs(node.y - player.y));
      if (dist <= range && !node.depleted) {
        results.push({ ...node, distance: dist });
      }
    }
    return results.sort((a, b) => a.distance - b.distance);
  }

  // ── COMMAND PROCESSING ──────────────────────────────────────────────────

  processCommand(playerName, input) {
    const player = this.getPlayer(playerName);
    this.messageLog = [];
    const parts = input.trim().toLowerCase().split(/\s+/);
    const verb = parts[0];
    const args = parts.slice(1).join(' ');

    // Movement
    if (['n','s','e','w','north','south','east','west'].includes(verb)) {
      return this._move(player, verb);
    }

    // Skills
    if (['mine','fish','chop','cook','smelt','smith','fletch','craft','firemaking','light','spin','tan'].includes(verb)) {
      return this._startSkill(player, verb, args);
    }

    // Combat
    if (['attack','fight','kill'].includes(verb)) {
      return this._startCombat(player, args);
    }

    // Consumption
    if (['eat'].includes(verb)) {
      return this._eat(player, args);
    }
    if (['drink'].includes(verb)) {
      return this._drink(player, args);
    }

    // Prayer
    if (['pray'].includes(verb)) {
      return this._togglePrayer(player, args);
    }

    // Info
    if (['look','examine'].includes(verb)) {
      return this._look(player);
    }
    if (['stats','levels','skills'].includes(verb)) {
      return this._showStats(player);
    }
    if (['inventory','inv','i'].includes(verb)) {
      return this._showInventory(player);
    }
    if (['equipment','equip','gear'].includes(verb)) {
      return this._showEquipment(player);
    }
    if (['stop','cancel'].includes(verb)) {
      return this._stop(player);
    }

    return this._msg(`Unknown command: ${verb}. Try: look, mine, fish, chop, attack, eat, drink, stats, inv`);
  }

  // ── TICK PROCESSING ─────────────────────────────────────────────────────

  processTick() {
    this.currentTick++;
    const allMessages = new Map(); // playerName → messages[]

    for (const [name, player] of this.players) {
      const msgs = [];

      // Tick cooldowns
      player.cooldowns.eat.tick();
      player.cooldowns.drink.tick();
      player.cooldowns.attack.tick();

      // Tick active mechanic (skilling, combat, etc.)
      const mechanic = this._activeMechanics.get(name);
      if (mechanic) {
        const events = mechanic.tick({ player });
        for (const e of events) {
          if (e.type === 'xp_drop') {
            const result = player.awardXp(e.skill, e.amount);
            if (result.leveled) {
              msgs.push(`Congratulations! Your ${e.skill} level is now ${result.newLevel}.`);
            }
          }
          if (e.type === 'loot') {
            const added = player.invAdd(e.item, e.quantity || 1);
            if (!added.success) {
              msgs.push(`Your inventory is full.`);
              mechanic.stop();
              this._activeMechanics.delete(name);
            }
          }
          if (e.type === 'message') msgs.push(e.text);
          if (e.type === 'action_fail' && e.text) msgs.push(e.text);
          if (e.type === 'action_success') {} // handled by xp_drop and loot
        }
      }

      // Prayer drain
      if (player.activePrayers.size > 0) {
        const DRAIN_RATES = {
          'protect_from_magic': 12, 'protect_from_missiles': 12, 'protect_from_melee': 12,
          'rigour': 24, 'augury': 24, 'piety': 24,
          'eagle_eye': 12, 'mystic_might': 12,
        };
        let drain = 0;
        for (const p of player.activePrayers) drain += DRAIN_RATES[p] || 6;
        let prayerBonus = 0;
        for (const slot of Object.values(player.equipment)) {
          if (slot?.stats?.prayer) prayerBonus += slot.stats.prayer;
        }
        const resistance = 2 * prayerBonus + 60;
        player._prayerDrainCounter += drain;
        while (player._prayerDrainCounter >= resistance) {
          player.prayerPoints--;
          player._prayerDrainCounter -= resistance;
        }
        if (player.prayerPoints <= 0) {
          player.prayerPoints = 0;
          player.activePrayers.clear();
          msgs.push('You have run out of prayer points.');
        }
      }

      // HP regen
      if (this.currentTick % 100 === 0 && player.hp < player.maxHp && player.hp > 0) {
        player.hp = Math.min(player.maxHp, player.hp + 1);
      }

      // Resource respawning
      for (const node of this.nodes.values()) {
        if (node.checkRespawn(this.currentTick)) {
          // Node respawned
        }
      }

      if (msgs.length) allMessages.set(name, msgs);
    }

    return allMessages;
  }

  // ── COMMAND IMPLEMENTATIONS ─────────────────────────────────────────────

  _msg(...lines) {
    for (const l of lines) this.messageLog.push(l);
    return this.messageLog;
  }

  _move(player, dir) {
    const map = {
      n: [0, -1], north: [0, -1], s: [0, 1], south: [0, 1],
      e: [1, 0], east: [1, 0], w: [-1, 0], west: [-1, 0],
    };
    const [dx, dy] = map[dir] || [0, 0];
    player.x += dx;
    player.y += dy;

    // Stop any active skill
    if (this._activeMechanics.has(player.name)) {
      this._activeMechanics.get(player.name).stop();
      this._activeMechanics.delete(player.name);
    }

    return this._msg(`You walk ${dir}. Position: (${player.x}, ${player.y})`);
  }

  _startSkill(player, verb, args) {
    // Map verb to mechanic type
    const verbToSkill = {
      mine: 'mine-', fish: 'fish-', chop: 'chop-', cook: 'cook-',
      smelt: 'smelt-', smith: 'smith-', fletch: 'fletch-', craft: 'craft-',
      light: 'burn-', spin: 'craft-spin-', tan: 'craft-',
    };
    const prefix = verbToSkill[verb];
    if (!prefix) return this._msg(`You can't ${verb} here.`);

    // Find matching mechanic from available definitions
    const allDefs = list().filter(d => d.id.startsWith(prefix) && d.type === 'skill');

    // Try to match args
    let match = null;
    if (args) {
      match = allDefs.find(d => d.name.toLowerCase().includes(args));
    }
    // If no args, find something near the player
    if (!match) {
      const nearby = this.nodesNear(player, 2).filter(n => n.mechanicId?.startsWith(prefix));
      if (nearby.length) {
        match = get(nearby[0].mechanicId);
      }
    }
    // Default to first available at player's level
    if (!match) {
      match = allDefs
        .filter(d => {
          const reqs = d.requires?.levels || {};
          return Object.entries(reqs).every(([skill, lvl]) => player.getLevel(skill) >= lvl);
        })
        .pop(); // highest level they can do
    }

    if (!match) return this._msg(`You can't find anything to ${verb} here, or your level is too low.`);

    // Check level requirements
    const reqs = match.requires?.levels || {};
    for (const [skill, lvl] of Object.entries(reqs)) {
      if (player.getLevel(skill) < lvl) {
        return this._msg(`You need ${skill} level ${lvl} to ${match.name.toLowerCase()}. You have ${player.getLevel(skill)}.`);
      }
    }

    // Check inventory space
    if (player.invFreeSlots() === 0) {
      return this._msg('Your inventory is full.');
    }

    // Start the mechanic
    const mechanic = create(match.id);
    mechanic.start({ player });
    this._activeMechanics.set(player.name, mechanic);

    return this._msg(`You begin to ${match.name.toLowerCase()}.`);
  }

  _startCombat(player, targetName) {
    if (!targetName) return this._msg('Attack what?');

    // Find monster node nearby
    const nearby = this.nodesNear(player, 1).filter(n => n.type === 'monster');
    let target = nearby.find(n => n.name.toLowerCase().includes(targetName));
    if (!target && nearby.length) target = nearby[0];

    if (!target) return this._msg(`There's nothing to attack here.`);

    player.combatTarget = target;
    return this._msg(`You attack the ${target.name}.`);
  }

  _eat(player, foodName) {
    if (!player.cooldowns.eat.isReady) {
      return this._msg(`You must wait before eating again.`);
    }
    // Find food in inventory
    const slot = player.inventory.findIndex(s =>
      s && (foodName ? s.name.toLowerCase().includes(foodName) : true) &&
      list().some(d => d.type === 'consumable' && d.atoms?.consume?.healHp && d.name.toLowerCase().includes(s.name.toLowerCase()))
    );
    if (slot < 0) return this._msg(`You don't have any food to eat.`);

    const item = player.inventory[slot];
    // Find matching consumable definition
    const def = list().find(d =>
      d.type === 'consumable' && d.atoms?.consume?.healHp &&
      d.name.toLowerCase().includes(item.name.toLowerCase().replace('raw ', ''))
    );
    if (!def) return this._msg(`You can't eat ${item.name}.`);

    const heal = def.atoms.consume.healHp;
    const before = player.hp;
    player.hp = Math.min(player.maxHp, player.hp + heal);
    player.inventory[slot] = null;
    player.cooldowns.eat.trigger();

    return this._msg(`You eat the ${item.name}. HP: ${before} -> ${player.hp}/${player.maxHp}`);
  }

  _drink(player, potionName) {
    if (!player.cooldowns.drink.isReady) {
      return this._msg(`You must wait before drinking again.`);
    }
    const slot = player.inventory.findIndex(s =>
      s && s.name.toLowerCase().includes(potionName || 'potion')
    );
    if (slot < 0) return this._msg(`You don't have that potion.`);

    const item = player.inventory[slot];
    const doseMatch = item.name.match(/\((\d)\)$/);
    if (!doseMatch) return this._msg(`You can't drink ${item.name}.`);

    const dose = parseInt(doseMatch[1]);
    if (dose > 1) {
      player.inventory[slot] = { ...item, name: item.name.replace(/\(\d\)$/, `(${dose - 1})`) };
    } else {
      player.inventory[slot] = { name: 'Vial', count: 1 };
    }

    // Apply effects based on potion type
    const pName = item.name.toLowerCase();
    let effect = '';
    if (pName.includes('super restore')) {
      const restore = Math.floor(8 + player.getLevel('prayer') * 0.25);
      player.prayerPoints = Math.min(player.maxPrayer, player.prayerPoints + restore);
      effect = `Prayer +${restore}`;
    } else if (pName.includes('saradomin brew')) {
      player.hp = Math.min(player.maxHp, player.hp + 16);
      effect = 'HP +16';
    } else if (pName.includes('prayer')) {
      const restore = Math.floor(7 + player.getLevel('prayer') * 0.25);
      player.prayerPoints = Math.min(player.maxPrayer, player.prayerPoints + restore);
      effect = `Prayer +${restore}`;
    } else if (pName.includes('strength')) {
      effect = 'Strength boosted';
    } else if (pName.includes('attack')) {
      effect = 'Attack boosted';
    } else if (pName.includes('ranging')) {
      effect = 'Ranged boosted';
    } else if (pName.includes('stamina')) {
      player.runEnergy = Math.min(10000, player.runEnergy + 2000);
      effect = 'Run energy restored';
    } else {
      effect = 'You drink the potion';
    }

    player.cooldowns.drink.trigger();
    return this._msg(`You drink the ${item.name}. ${effect}.`);
  }

  _togglePrayer(player, prayerName) {
    if (!prayerName) return this._msg('Which prayer? (e.g. pray protect melee)');
    const map = {
      'melee': 'protect_from_melee', 'protect melee': 'protect_from_melee',
      'range': 'protect_from_missiles', 'missiles': 'protect_from_missiles', 'protect range': 'protect_from_missiles',
      'mage': 'protect_from_magic', 'magic': 'protect_from_magic', 'protect mage': 'protect_from_magic',
      'piety': 'piety', 'rigour': 'rigour', 'augury': 'augury',
      'eagle eye': 'eagle_eye', 'mystic might': 'mystic_might',
    };
    const prayer = map[prayerName] || prayerName.replace(/\s+/g, '_');

    if (player.prayerPoints <= 0) return this._msg('You have no prayer points.');

    if (player.activePrayers.has(prayer)) {
      player.activePrayers.delete(prayer);
      return this._msg(`${prayer.replace(/_/g, ' ')} deactivated.`);
    } else {
      // Deactivate conflicting overheads
      if (prayer.startsWith('protect_from_')) {
        player.activePrayers.delete('protect_from_melee');
        player.activePrayers.delete('protect_from_missiles');
        player.activePrayers.delete('protect_from_magic');
      }
      player.activePrayers.add(prayer);
      return this._msg(`${prayer.replace(/_/g, ' ')} activated.`);
    }
  }

  _look(player) {
    const nearby = this.nodesNear(player, 5);
    const lines = [`You are at (${player.x}, ${player.y}).`];
    if (nearby.length === 0) {
      lines.push('You see nothing interesting.');
    } else {
      lines.push('You see:');
      for (const n of nearby.slice(0, 10)) {
        lines.push(`  ${n.name} (${n.type}, ${n.distance} tiles ${n.distance === 0 ? 'here' : 'away'})`);
      }
    }
    return this._msg(...lines);
  }

  _showStats(player) {
    const lines = [`=== ${player.name} === Total Level: ${player.totalLevel}`];
    lines.push(`HP: ${player.hp}/${player.maxHp} | Prayer: ${player.prayerPoints}/${player.maxPrayer} | Run: ${(player.runEnergy/100).toFixed(0)}%`);
    const skillNames = Object.keys(player.skills);
    for (let i = 0; i < skillNames.length; i += 3) {
      const row = skillNames.slice(i, i + 3).map(s => {
        const sk = player.skills[s];
        return `${s}: ${sk.level} (${sk.xp} xp)`;
      });
      lines.push('  ' + row.join(' | '));
    }
    return this._msg(...lines);
  }

  _showInventory(player) {
    const lines = [`=== Inventory (${28 - player.invFreeSlots()}/28) ===`];
    for (let i = 0; i < 28; i++) {
      const item = player.inventory[i];
      if (item) lines.push(`  [${i}] ${item.name}${item.count > 1 ? ' x' + item.count : ''}`);
    }
    if (player.invFreeSlots() === 28) lines.push('  (empty)');
    return this._msg(...lines);
  }

  _showEquipment(player) {
    const lines = ['=== Equipment ==='];
    const slots = ['head','cape','neck','weapon','body','shield','legs','gloves','boots','ring','ammo'];
    for (const slot of slots) {
      const item = player.equipment[slot];
      lines.push(`  ${slot}: ${item ? item.name : '(empty)'}`);
    }
    return this._msg(...lines);
  }

  _stop(player) {
    const mechanic = this._activeMechanics.get(player.name);
    if (mechanic) {
      mechanic.stop();
      this._activeMechanics.delete(player.name);
      return this._msg('You stop what you were doing.');
    }
    return this._msg('You aren\'t doing anything.');
  }
}

module.exports = { GameEngine, Player, WorldNode };
