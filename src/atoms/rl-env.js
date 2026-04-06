// ══════════════════════════════════════════════════════════════════════════════
// RL ENVIRONMENT — Train agents on any mechanic via the atom engine
//
// Every mechanic config becomes a trainable environment.
// The agent learns optimal play through rewards, not scripts.
//
// Connects to Python RL via the same stdin/stdout JSON protocol
// used by the Inferno training bridge.
//
// Usage:
//   node src/atoms/rl-env.js --type=skill --mechanic=mine-iron
//   node src/atoms/rl-env.js --type=combat --mechanic=mob-hill-giant
//   node src/atoms/rl-env.js --type=quest --mechanic=quest-cooks-assistant
// ══════════════════════════════════════════════════════════════════════════════

const readline = require('readline');

// Load all mechanics
require('./definitions');
const { create, get, list } = require('./mechanic');
const { GameEngine } = require('./engine');
const { populateWorld } = require('./world-builder');

// ── ENVIRONMENT CONFIGS PER TYPE ────────────────────────────────────────────

const ENV_CONFIGS = {
  // Skilling: agent learns when to skill, when to bank, when to eat
  skill: {
    actions: ['wait', 'skill', 'eat', 'drink', 'bank', 'walk_n', 'walk_s', 'walk_e', 'walk_w', 'stop'],
    obsSize: 20,
    maxSteps: 1000,
    buildObs(player, engine) {
      return [
        player.hp / player.maxHp,
        player.prayerPoints / Math.max(player.maxPrayer, 1),
        player.runEnergy / 10000,
        player.invFreeSlots() / 28,
        // Skill levels (normalized to 99)
        player.getLevel('mining') / 99,
        player.getLevel('fishing') / 99,
        player.getLevel('woodcutting') / 99,
        player.getLevel('cooking') / 99,
        player.getLevel('smithing') / 99,
        player.getLevel('crafting') / 99,
        player.getLevel('firemaking') / 99,
        player.getLevel('herblore') / 99,
        player.getLevel('fletching') / 99,
        player.getLevel('runecraft') / 99,
        player.getLevel('agility') / 99,
        player.getLevel('thieving') / 99,
        player.getLevel('farming') / 99,
        player.getLevel('hunter') / 99,
        player.getLevel('construction') / 99,
        player.getLevel('prayer') / 99,
      ];
    },
    reward(player, prevState, events) {
      let r = 0;
      for (const e of events) {
        if (e.type === 'xp_drop') r += e.amount * 0.01;  // XP is good
        if (e.type === 'loot') r += 0.5;                  // Getting items is good
        if (e.type === 'action_fail') r -= 0.1;           // Failing wastes time
      }
      // Penalty for full inventory doing nothing
      if (player.invFreeSlots() === 0) r -= 0.5;
      // Small survival bonus
      r += 0.01;
      return r;
    },
  },

  // Combat: agent learns to fight, pray, eat, position
  combat: {
    actions: ['wait', 'attack', 'eat', 'drink', 'pray_melee', 'pray_range', 'pray_mage',
              'walk_n', 'walk_s', 'walk_e', 'walk_w', 'special_attack'],
    obsSize: 25,
    maxSteps: 500,
    buildObs(player, engine) {
      const target = player.combatTarget;
      return [
        player.hp / player.maxHp,
        player.prayerPoints / Math.max(player.maxPrayer, 1),
        player.getLevel('attack') / 99,
        player.getLevel('strength') / 99,
        player.getLevel('defence') / 99,
        player.getLevel('ranged') / 99,
        player.getLevel('magic') / 99,
        player.getLevel('hitpoints') / 99,
        player.invFreeSlots() / 28,
        // Active prayers
        player.activePrayers.has('protect_from_melee') ? 1 : 0,
        player.activePrayers.has('protect_from_missiles') ? 1 : 0,
        player.activePrayers.has('protect_from_magic') ? 1 : 0,
        // Target info
        target ? target.hp / target.maxHp : 0,
        target ? target.maxHit / 60 : 0,
        target ? 1 : 0, // has target
        // Food count
        player.inventory.filter(s => s && list().some(d => d.type === 'consumable' && d.atoms?.consume?.healHp)).length / 28,
        // Potion count
        player.inventory.filter(s => s && s.name?.match(/\(\d\)$/)).length / 28,
        // Combat stats
        player.getLevel('prayer') / 99,
        player.cooldowns.attack.isReady ? 1 : 0,
        player.cooldowns.eat.isReady ? 1 : 0,
        // Padding
        0, 0, 0, 0, 0,
      ];
    },
    reward(player, prevState, events) {
      let r = 0;
      const hpLost = prevState.hp - player.hp;
      const ppLost = prevState.pp - player.prayerPoints;

      // Damage dealt = good
      for (const e of events) {
        if (e.type === 'hit_result' && e.hit) r += e.damage * 0.1;
        if (e.type === 'xp_drop') r += e.amount * 0.01;
      }

      // HP lost = bad
      if (hpLost > 0) r -= hpLost * 0.05;

      // Kill = big reward
      if (player.combatTarget && player.combatTarget.hp <= 0) r += 5.0;

      // Death = very bad
      if (player.hp <= 0) r -= 10.0;

      // Survival
      r += 0.01;

      return r;
    },
  },

  // Quest: agent learns to complete quest objectives
  quest: {
    actions: ['wait', 'talk', 'walk_n', 'walk_s', 'walk_e', 'walk_w',
              'use_item', 'pick_up', 'examine', 'attack'],
    obsSize: 15,
    maxSteps: 2000,
    buildObs(player, engine) {
      return [
        player.hp / player.maxHp,
        player.x / 200,
        player.y / 200,
        player.invFreeSlots() / 28,
        player.getLevel('attack') / 99,
        player.getLevel('mining') / 99,
        player.getLevel('cooking') / 99,
        player.getLevel('crafting') / 99,
        // Quest progress (generic)
        0, 0, 0, 0, 0, 0, 0,
      ];
    },
    reward(player, prevState, events) {
      let r = 0;
      for (const e of events) {
        if (e.type === 'dialogue_line') r += 0.1;   // Talking = progress
        if (e.type === 'xp_drop') r += e.amount * 0.01;
        if (e.type === 'achievement_trigger') r += 10.0; // Quest complete!
      }
      r += 0.01; // survival
      return r;
    },
  },
};

// ── RL ENVIRONMENT ──────────────────────────────────────────────────────────

class AtomRLEnv {
  constructor(envType, mechanicId) {
    this.envType = envType;
    this.mechanicId = mechanicId;
    this.config = ENV_CONFIGS[envType];
    if (!this.config) throw new Error(`Unknown env type: ${envType}`);

    this.engine = new GameEngine();
    populateWorld(this.engine);
    this.player = null;
    this.episode = 0;
    this.step = 0;
  }

  reset() {
    this.episode++;
    this.step = 0;

    // Fresh player each episode
    const name = `RL_${this.episode}`;
    this.player = this.engine.getPlayer(name);

    // Give starter stats based on mechanic requirements
    const def = get(this.mechanicId);
    if (def?.requires?.levels) {
      for (const [skill, level] of Object.entries(def.requires.levels)) {
        const xp = require('./xp-drop').xpForLevel(level);
        this.player.awardXp(skill, xp);
      }
    }

    // Give some supplies
    this.player.hp = this.player.maxHp;
    this.player.prayerPoints = this.player.maxPrayer;
    for (let i = 0; i < 5; i++) this.player.invAdd('Lobster');
    for (let i = 0; i < 3; i++) this.player.invAdd('Prayer potion(4)');

    const obs = this.config.buildObs(this.player, this.engine);
    return { type: 'state', obs, done: false, reward: 0 };
  }

  doStep(actionId) {
    this.step++;
    const action = this.config.actions[actionId];
    const prevState = { hp: this.player.hp, pp: this.player.prayerPoints };

    // Execute action
    let events = [];
    switch (action) {
      case 'wait': break;
      case 'skill':
      case 'mine':
      case 'fish':
      case 'chop':
        this.engine.processCommand(this.player.name, this.mechanicId.split('-')[0]);
        break;
      case 'attack':
        this.engine.processCommand(this.player.name, 'attack');
        break;
      case 'eat':
        this.engine.processCommand(this.player.name, 'eat');
        break;
      case 'drink':
        this.engine.processCommand(this.player.name, 'drink restore');
        break;
      case 'pray_melee':
        this.engine.processCommand(this.player.name, 'pray melee');
        break;
      case 'pray_range':
        this.engine.processCommand(this.player.name, 'pray range');
        break;
      case 'pray_mage':
        this.engine.processCommand(this.player.name, 'pray mage');
        break;
      case 'walk_n': this.engine.processCommand(this.player.name, 'n'); break;
      case 'walk_s': this.engine.processCommand(this.player.name, 's'); break;
      case 'walk_e': this.engine.processCommand(this.player.name, 'e'); break;
      case 'walk_w': this.engine.processCommand(this.player.name, 'w'); break;
      case 'stop': this.engine.processCommand(this.player.name, 'stop'); break;
      case 'talk': this.engine.processCommand(this.player.name, 'talk'); break;
      default: break;
    }

    // Tick the engine
    const tickMsgs = this.engine.processTick();
    const playerMsgs = tickMsgs.get(this.player.name) || [];

    // Collect events from tick
    // (simplified — in a full implementation, the engine would emit structured events)

    const reward = this.config.reward(this.player, prevState, events);
    const done = this.player.hp <= 0 || this.step >= this.config.maxSteps;
    const obs = this.config.buildObs(this.player, this.engine);

    return { type: 'state', obs, done, reward, step: this.step, messages: playerMsgs };
  }
}

// ── STDIN/STDOUT PROTOCOL (same as Inferno bridge) ──────────────────────────

if (require.main === module) {
  const args = {};
  process.argv.slice(2).forEach(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    args[k] = v;
  });

  const envType = args.type || 'skill';
  const mechanicId = args.mechanic || 'mine-iron';

  console.error(`[rl-env] Starting ${envType} environment for ${mechanicId}`);

  const env = new AtomRLEnv(envType, mechanicId);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

  rl.on('line', (line) => {
    try {
      const cmd = JSON.parse(line.trim());
      let result;

      if (cmd.type === 'reset') {
        result = env.reset();
      } else if (cmd.type === 'step') {
        result = env.doStep(cmd.action);
      } else if (cmd.type === 'info') {
        result = {
          type: 'info',
          envType,
          mechanicId,
          numActions: env.config.actions.length,
          obsSize: env.config.obsSize,
          actions: env.config.actions,
        };
      } else {
        result = { type: 'error', msg: 'unknown command' };
      }

      process.stdout.write(JSON.stringify(result) + '\n');
    } catch (err) {
      process.stdout.write(JSON.stringify({ type: 'error', msg: err.message }) + '\n');
    }
  });

  console.error('[rl-env] Ready');
}

module.exports = { AtomRLEnv, ENV_CONFIGS };
