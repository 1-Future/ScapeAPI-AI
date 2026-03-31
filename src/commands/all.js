// ── All game commands (Tiers 6-18) ────────────────────────────────────────────
// Wires items, recipes, shops, quests, slayer, trading, and all remaining systems

const commands = require('../engine/commands');
const items = require('../data/items');
const recipes = require('../data/recipes');
const shops = require('../data/shops');
const quests = require('../data/quests');
const droptables = require('../data/droptables');
const slayer = require('../data/slayer');

module.exports = function registerAll(ctx) {
  const { players, playersByName, groundItems, tick, events, persistence,
    tiles, walls, npcs, objects, pathfinding, combat, actions,
    getLevel, getXp, addXp, totalLevel, combatLevel,
    getBoostedLevel, calcWeight,
    invAdd, invRemove, invCount, invFreeSlots,
    send, sendText, broadcast, findPlayer, nextItemId,
    getLevelUpMessage, clans } = ctx;

  // Helper: recalculate player weight
  function updateWeight(p) {
    if (calcWeight) calcWeight(p, (id) => items.get(id));
  }

  // Helper: format level-up message with unlocks
  function levelUpMsg(skill, level) {
    const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
    let msg = `\nCongratulations! ${skillName} level ${level}!`;
    if (getLevelUpMessage) {
      const unlock = getLevelUpMessage(skill, level);
      if (unlock) msg += ` ${unlock}`;
    }
    // Broadcast milestone level-ups (every 10 levels or 99)
    if (level % 10 === 0 || level === 99) {
      // Notify nearby players
      for (const [w, pl] of players) {
        for (const [w2, pl2] of players) {
          if (pl2 !== pl && Math.abs(pl2.x - pl.x) <= 15 && Math.abs(pl2.y - pl.y) <= 15) {
            // We can't easily get the leveling player here, so we skip broadcast in this helper
          }
        }
        break;
      }
    }
    return msg;
  }

  // Helper: compact skill name for XP drops (feature 11)
  const SKILL_SHORT = {
    attack: 'Att', strength: 'Str', defence: 'Def', hitpoints: 'HP',
    ranged: 'Range', prayer: 'Prayer', magic: 'Magic', runecrafting: 'RC',
    construction: 'Con', agility: 'Agil', herblore: 'Herb', thieving: 'Thieving',
    crafting: 'Craft', fletching: 'Fletch', slayer: 'Slay', hunter: 'Hunter',
    mining: 'Mining', smithing: 'Smith', fishing: 'Fish', cooking: 'Cook',
    firemaking: 'FM', woodcutting: 'WC', farming: 'Farm',
  };
  function xpDrop(skill, xp) {
    return ` (+${typeof xp === 'number' && xp % 1 !== 0 ? xp.toFixed(1) : xp} ${SKILL_SHORT[skill] || skill})`;
  }

  // ── Agility course definition ────────────────────────────────────────────
  const AGILITY_COURSES = {
    town_rooftop: {
      name: 'Town Rooftop Course',
      levelReq: 1,
      obstacles: [
        { name: 'Low wall', defId: 'agility_wall', x: 95, y: 80, xp: 8 },
        { name: 'Rooftop edge', defId: 'agility_rooftop', x: 95, y: 82, xp: 8 },
        { name: 'Gap', defId: 'agility_gap', x: 98, y: 80, xp: 10 },
        { name: 'Obstacle net', defId: 'agility_net', x: 101, y: 80, xp: 10 },
        { name: 'Balancing log', defId: 'agility_log', x: 104, y: 80, xp: 12 },
        { name: 'Ladder', defId: 'agility_ladder', x: 107, y: 80, xp: 12 },
      ],
      lapBonus: 30,
    },
  };

  // ── Eating food (3-tick delay — feature 5) ─────────────────────────────────
  commands.register('eat', { help: 'Eat food to heal: eat [item]', category: 'Items',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      const currentTick = tick.getTick();
      if (p.nextEatTick && currentTick < p.nextEatTick) {
        return `You must wait ${p.nextEatTick - currentTick} ticks before eating again.`;
      }
      const slot = p.inventory.findIndex(s => s && s.name.toLowerCase() === name);
      if (slot < 0) return `You don't have "${name}".`;
      const item = p.inventory[slot];
      const heal = items.FOOD_HEAL[item.id];
      if (!heal) return `You can't eat ${item.name}.`;
      if (p.hp >= p.maxHp) return 'You are already at full health.';
      p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
      const healed = Math.min(heal, p.maxHp - p.hp);
      p.hp += healed;
      p.nextEatTick = currentTick + 3; // 3-tick eat delay
      updateWeight(p);
      return `You eat the ${item.name}. HP: ${p.hp}/${p.maxHp} (+${healed})`;
    }
  });

  // ── Bury bones ──────────────────────────────────────────────────────────────
  commands.register('bury', { help: 'Bury bones for Prayer XP: bury [bones]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase() || 'bones';
      const slot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes(name) && s.name.toLowerCase().includes('bone'));
      if (slot < 0) return `You don't have any bones.`;
      const item = p.inventory[slot];
      const xpMap = { 100: 4.5, 106: 15, 107: 72 }; // bones, big bones, dragon bones
      const xp = xpMap[item.id] || 4.5;
      p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
      updateWeight(p);
      const lvl = addXp(p, 'prayer', xp);
      let msg = `You bury the ${item.name}.${xpDrop('prayer', xp)}`;
      if (lvl) msg += levelUpMsg('prayer', lvl);
      events.emit('skill_action', { player: p, skill: 'prayer' });
      return msg;
    }
  });

  // ── Prayer altar (feature 1) ──────────────────────────────────────────────
  const BONE_XP = { 100: 4.5, 106: 15, 107: 72 };
  const ALTAR_MULTIPLIER = 3.5;

  commands.register('pray', { help: 'Toggle prayer, use bones on altar, or restore prayer: pray [name] / pray at altar / pray at', category: 'Combat',
    fn: (p, args) => {
      const argStr = args.join(' ').toLowerCase();

      // "pray at altar" — use bones on altar for 3.5x XP
      if (argStr === 'at altar') {
        const altar = objects.findObjectByName('altar', p.x, p.y, 3, p.layer);
        if (!altar) return 'There is no altar nearby.';
        // Find bones in inventory
        const slot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes('bone'));
        if (slot < 0) return 'You have no bones to offer.';
        const item = p.inventory[slot];
        const baseXp = BONE_XP[item.id] || 4.5;
        const xp = Math.floor(baseXp * ALTAR_MULTIPLIER * 10) / 10;
        p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
        updateWeight(p);
        const lvl = addXp(p, 'prayer', xp);
        let msg = `You offer the ${item.name} to the altar.${xpDrop('prayer', xp)}`;
        if (lvl) msg += levelUpMsg('prayer', lvl);
        return msg;
      }

      // "pray at" — restore prayer points at altar
      if (argStr === 'at') {
        const altar = objects.findObjectByName('altar', p.x, p.y, 3, p.layer);
        if (!altar) return 'There is no altar nearby.';
        const maxPrayer = getLevel(p, 'prayer');
        if (p.prayerPoints >= maxPrayer) return 'Your prayer is already full.';
        p.prayerPoints = maxPrayer;
        return `You pray at the altar. Prayer points restored to ${p.prayerPoints}/${maxPrayer}.`;
      }

      // Standard prayer toggle
      if (!args[0] || args[0] === 'off') { p.activePrayers.clear(); return 'All prayers off.'; }
      const name = args.join('_').toLowerCase();
      if (p.activePrayers.has(name)) { p.activePrayers.delete(name); return `${name} off.`; }
      p.activePrayers.add(name);
      return `${name} on. Prayer points: ${p.prayerPoints}`;
    }
  });

  // ── Generic tick-based recipe processing ──────────────────────────────────
  function startRecipeAction(p, recipe, skill, verb, extraCheck) {
    if (getLevel(p, skill) < recipe.level) return `You need ${skill.charAt(0).toUpperCase() + skill.slice(1)} level ${recipe.level}.`;
    if (extraCheck) { const err = extraCheck(); if (err) return err; }
    for (const input of recipe.inputs) {
      if (invCount(p, input.id) < input.count) return `You need ${input.count}x ${items.get(input.id)?.name || 'item'}.`;
    }
    if (p.busy) actions.cancel(p);
    actions.start(p, {
      type: skill,
      ticks: recipe.ticks || 4,
      repeat: true,
      data: { recipe, player: p, skill, verb },
      onTick: (data, ticksLeft) => ticksLeft === (data.recipe.ticks || 4) - 1 ? `You begin to ${data.verb} ${data.recipe.name}...` : null,
      onComplete: (data) => {
        const r = data.recipe;
        const pl = data.player;
        // Check materials still available
        for (const input of r.inputs) { if (invCount(pl, input.id) < input.count) { actions.cancel(pl); return 'You run out of materials.'; } }
        // Fail chance (smelting iron)
        if (r.failChance && Math.random() < r.failChance) {
          for (const input of r.inputs) invRemove(pl, input.id, input.count);
          updateWeight(pl);
          return `You fail to ${data.verb} ${r.name}.`;
        }
        // Burn check (cooking)
        if (r.stopBurn) {
          const burnChance = Math.max(0, (r.stopBurn - getLevel(pl, data.skill)) / r.stopBurn);
          if (Math.random() < burnChance) {
            for (const input of r.inputs) invRemove(pl, input.id, input.count);
            if (r.failItem) invAdd(pl, r.failItem, items.get(r.failItem)?.name || 'Burnt food', 1);
            updateWeight(pl);
            return `You accidentally burn the ${r.name}.`;
          }
        }
        for (const input of r.inputs) invRemove(pl, input.id, input.count);
        for (const output of r.outputs) invAdd(pl, output.id, items.get(output.id)?.name || r.name, output.count, items.get(output.id)?.stackable);
        const lvl = addXp(pl, data.skill, r.xp);
        updateWeight(pl);
        let msg = `You ${data.verb} ${r.name}.${xpDrop(data.skill, r.xp)}`;
        if (lvl) msg += levelUpMsg(data.skill, lvl);
        // Track skilling action for achievements/dailies
        events.emit('skill_action', { player: pl, skill: data.skill });
        // Can we repeat?
        for (const input of r.inputs) { if (invCount(pl, input.id) < input.count) { actions.cancel(pl); msg += ' You run out of materials.'; } }
        return msg;
      },
    });
    return `You begin to ${verb} ${recipe.name}...`;
  }

  // ── Cooking (tick-based) ─────────────────────────────────────────────────────
  commands.register('cook', { help: 'Cook food: cook [item]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) {
        const available = recipes.forSkill('cooking').filter(r => getLevel(p, 'cooking') >= r.level);
        return 'Cooking recipes:\n' + available.map(r => `  ${r.name} (lvl ${r.level}, ${r.xp} XP, ${r.ticks}t)`).join('\n');
      }
      const recipe = recipes.forSkill('cooking').find(r => r.name.toLowerCase() === name || r.outputs[0]?.id === items.find(name)?.id);
      if (!recipe) return `Unknown recipe: ${name}. Type \`cook\` to see recipes.`;
      return startRecipeAction(p, recipe, 'cooking', 'cook');
    }
  });

  // ── Smithing (tick-based) ────────────────────────────────────────────────────
  commands.register('smelt', { help: 'Smelt ore into bars: smelt [bar]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) {
        const available = recipes.forSkill('smithing').filter(r => r.station === 'furnace' && getLevel(p, 'smithing') >= r.level);
        return 'Smelting recipes:\n' + available.map(r => `  ${r.name} (lvl ${r.level}, ${r.xp} XP, ${r.ticks}t)`).join('\n');
      }
      const recipe = recipes.forSkill('smithing').find(r => r.station === 'furnace' && r.name.toLowerCase().includes(name));
      if (!recipe) return `Unknown smelting recipe: ${name}. Type \`smelt\` to see recipes.`;
      return startRecipeAction(p, recipe, 'smithing', 'smelt');
    }
  });

  commands.register('smith', { help: 'Smith bars into items: smith [item]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) {
        const available = recipes.forSkill('smithing').filter(r => r.station === 'anvil' && getLevel(p, 'smithing') >= r.level);
        return 'Smithing recipes:\n' + available.map(r => `  ${r.name} (lvl ${r.level}, ${r.xp} XP, ${r.ticks}t)`).join('\n');
      }
      const recipe = recipes.forSkill('smithing').find(r => r.station === 'anvil' && r.name.toLowerCase().includes(name));
      if (!recipe) return `Unknown smithing recipe: ${name}. Type \`smith\` to see recipes.`;
      return startRecipeAction(p, recipe, 'smithing', 'smith', () => !invCount(p, 570) ? 'You need a hammer.' : null);
    }
  });

  // ── Crafting (tick-based) ────────────────────────────────────────────────────
  commands.register('craft', { help: 'Craft items: craft [item]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) {
        const available = recipes.forSkill('crafting').filter(r => getLevel(p, 'crafting') >= r.level);
        return 'Crafting recipes:\n' + available.map(r => `  ${r.name} (lvl ${r.level}, ${r.xp} XP, ${r.ticks}t)`).join('\n');
      }
      const recipe = recipes.forSkill('crafting').find(r => r.name.toLowerCase().includes(name));
      if (!recipe) return `Unknown crafting recipe: ${name}. Type \`craft\` to see recipes.`;
      return startRecipeAction(p, recipe, 'crafting', 'craft');
    }
  });

  // ── Fletching (tick-based) ──────────────────────────────────────────────────
  commands.register('fletch', { help: 'Fletch items: fletch [item]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) {
        const available = recipes.forSkill('fletching').filter(r => getLevel(p, 'fletching') >= r.level);
        return 'Fletching recipes:\n' + available.map(r => `  ${r.name} (lvl ${r.level}, ${r.xp} XP, ${r.ticks}t)`).join('\n');
      }
      const recipe = recipes.forSkill('fletching').find(r => r.name.toLowerCase().includes(name));
      if (!recipe) return `Unknown fletching recipe: ${name}. Type \`fletch\` to see recipes.`;
      return startRecipeAction(p, recipe, 'fletching', 'fletch');
    }
  });

  // ── Herblore (tick-based) ──────────────────────────────────────────────────
  commands.register('clean', { help: 'Clean a grimy herb: clean [herb]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      const recipe = recipes.forSkill('herblore').find(r => r.name.toLowerCase().includes(name) && r.id.startsWith('clean'));
      if (!recipe) return 'Usage: clean [herb name]. E.g., clean guam';
      return startRecipeAction(p, recipe, 'herblore', 'clean');
    }
  });

  commands.register('mix', { help: 'Mix a potion: mix [potion]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) {
        const available = recipes.forSkill('herblore').filter(r => r.id.startsWith('mix') && getLevel(p, 'herblore') >= r.level);
        return 'Potion recipes:\n' + available.map(r => `  ${r.name} (lvl ${r.level}, ${r.xp} XP, ${r.ticks}t)`).join('\n');
      }
      const recipe = recipes.forSkill('herblore').find(r => r.id.startsWith('mix') && r.name.toLowerCase().includes(name));
      if (!recipe) return `Unknown potion: ${name}. Type \`mix\` to see recipes.`;
      return startRecipeAction(p, recipe, 'herblore', 'mix');
    }
  });

  // ── Firemaking (tick-based) ─────────────────────────────────────────────────
  commands.register('light', { help: 'Light logs: light [logs]', aliases: ['burn'], category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase() || 'logs';
      const recipe = recipes.forSkill('firemaking').find(r => r.name.toLowerCase().includes(name));
      if (!recipe) return `Unknown: ${name}. Type \`light\` with: logs, oak, willow, maple, yew, magic`;
      return startRecipeAction(p, recipe, 'firemaking', 'light', () => !invCount(p, 573) ? 'You need a tinderbox.' : null);
    }
  });

  // ── High Alchemy ────────────────────────────────────────────────────────────
  commands.register('alch', { help: 'High alchemy: alch [item]', aliases: ['highalch'], category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      const slot = p.inventory.findIndex(s => s && s.name.toLowerCase() === name);
      if (slot < 0) return `You don't have "${name}".`;
      if (getLevel(p, 'magic') < 55) return 'You need Magic level 55.';
      if (invCount(p, 278) < 1) return 'You need a nature rune.';
      if (invCount(p, 273) < 5) return 'You need 5 fire runes.';
      const item = p.inventory[slot];
      const def = items.get(item.id) || items.find(item.name);
      const value = def ? def.highAlch : Math.floor((def?.value || 1) * 0.6);
      p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
      invRemove(p, 278, 1); // nature rune
      invRemove(p, 273, 5); // fire runes
      invAdd(p, 101, 'Coins', value, true);
      const lvl = addXp(p, 'magic', 65);
      let msg = `You alch the ${item.name} for ${value} coins.${xpDrop('magic', 65)}`;
      if (lvl) msg += levelUpMsg('magic', lvl);
      return msg;
    }
  });

  // ── Shops ───────────────────────────────────────────────────────────────────
  commands.register('shop', { help: 'Browse a shop: shop [name] or shop', category: 'Economy',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      let shop;
      if (name) {
        shop = shops.findByNpc(name) || shops.getShop(name);
      } else {
        // Find nearby shop NPC
        const nearby = npcs.getNpcsNear(p.x, p.y, 5, p.layer);
        for (const npc of nearby) {
          shop = shops.findByNpc(npc.name);
          if (shop) break;
        }
      }
      if (!shop) return 'No shop found. Try: shop [shopkeeper name]';
      let out = `── ${shop.name} ──\n`;
      shop.stock.forEach((s, i) => {
        const price = shops.buyPrice(shop, i);
        out += `  [${i}] ${s.name} — ${price} coins (stock: ${s.current})\n`;
      });
      out += `\nType \`buy [number] [amount]\` or \`sell [item]\``;
      p._currentShop = shop.id;
      return out;
    }
  });

  commands.register('buy', { help: 'Buy from shop: buy [slot] [amount]', category: 'Economy',
    fn: (p, args) => {
      if (!p._currentShop) return 'Open a shop first with `shop`.';
      const shop = shops.getShop(p._currentShop);
      if (!shop) return 'Shop not found.';
      const slot = parseInt(args[0]);
      const count = parseInt(args[1]) || 1;
      if (isNaN(slot)) return 'Usage: buy [slot number] [amount]';
      const result = shops.buy(shop, slot, count);
      if (!result) return 'Out of stock or invalid slot.';
      if (invCount(p, 101) < result.price) return `You need ${result.price} coins. You have ${invCount(p, 101)}.`;
      invRemove(p, 101, result.price);
      const itemDef = items.get(result.itemId);
      invAdd(p, result.itemId, result.name, result.count, itemDef?.stackable);
      return `Bought ${result.count}x ${result.name} for ${result.price} coins.`;
    }
  });

  commands.register('sell', { help: 'Sell to shop: sell [item]', category: 'Economy',
    fn: (p, args) => {
      if (!p._currentShop) return 'Open a shop first with `shop`.';
      const shop = shops.getShop(p._currentShop);
      if (!shop) return 'Shop not found.';
      const name = args.join(' ').toLowerCase();
      const slot = p.inventory.findIndex(s => s && s.name.toLowerCase() === name);
      if (slot < 0) return `You don't have "${name}".`;
      const item = p.inventory[slot];
      const def = items.get(item.id) || items.find(item.name);
      const value = def ? def.value : 1;
      const price = shops.sell(shop, item.id, item.name, 1, value);
      p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
      invAdd(p, 101, 'Coins', price, true);
      return `Sold ${item.name} for ${price} coins.`;
    }
  });

  // ── Item lookup ─────────────────────────────────────────────────────────────
  commands.register('item', { help: 'Lookup item: item [name]', aliases: ['iteminfo'], category: 'Items',
    fn: (p, args) => {
      const name = args.join(' ');
      const def = items.find(name);
      if (!def) {
        const results = items.search(name);
        if (results.length === 0) return `No item found: "${name}"`;
        return `Did you mean:\n` + results.slice(0, 10).map(i => `  ${i.name} (id: ${i.id})`).join('\n');
      }
      let out = `── ${def.name} ──\n  ${def.examine}\n`;
      out += `  Value: ${def.value} | High Alch: ${def.highAlch} | Weight: ${def.weight}kg\n`;
      out += `  Tradeable: ${def.tradeable ? 'Yes' : 'No'} | Stackable: ${def.stackable ? 'Yes' : 'No'}\n`;
      if (def.equipSlot) out += `  Equip: ${def.equipSlot}${def.speed ? ` | Speed: ${def.speed}` : ''}\n`;
      if (Object.keys(def.stats).length) out += `  Stats: ${Object.entries(def.stats).map(([k,v]) => `${k}:${v}`).join(', ')}\n`;
      if (Object.keys(def.equipReqs).length) out += `  Requires: ${Object.entries(def.equipReqs).map(([k,v]) => `${k} ${v}`).join(', ')}\n`;
      return out;
    }
  });

  // ── Quests ──────────────────────────────────────────────────────────────────
  commands.register('quests', { help: 'List quests', aliases: ['questlist'], category: 'Quests',
    fn: (p) => {
      const all = quests.listAll();
      let out = `Quests (${all.length}):\n`;
      for (const q of all) {
        const status = quests.getStatus(p, q.id);
        const icon = status.complete ? '[✓]' : status.started ? '[~]' : '[ ]';
        out += `  ${icon} ${q.name} (${q.difficulty}, ${q.questPoints} QP)\n`;
      }
      out += `\nQuest Points: ${quests.getQuestPoints(p)}`;
      return out;
    }
  });

  commands.register('quest', { help: 'Quest info/progress: quest [name]', category: 'Quests',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      const quest = [...quests.quests.values()].find(q => q.name.toLowerCase().includes(name));
      if (!quest) return `Unknown quest: "${name}". Type \`quests\` to see all.`;
      const status = quests.getStatus(p, quest.id);
      let out = `── ${quest.name} ── (${quest.difficulty})\n${quest.description}\n`;
      out += `QP: ${quest.questPoints} | Status: ${status.complete ? 'COMPLETE' : status.started ? `Step ${status.step + 1}/${quest.steps.length}` : 'Not started'}\n`;
      if (status.started && !status.complete) {
        out += `\nCurrent step: ${quest.steps[status.step].text}\n`;
      }
      if (Object.keys(quest.requirements).length) {
        if (quest.requirements.skills) out += `Requirements: ${Object.entries(quest.requirements.skills).map(([k,v]) => `${k} ${v}`).join(', ')}\n`;
      }
      return out;
    }
  });

  commands.register('startquest', { help: 'Start a quest: startquest [name]', category: 'Quests',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      const quest = [...quests.quests.values()].find(q => q.name.toLowerCase().includes(name));
      if (!quest) return `Unknown quest: "${name}".`;
      const status = quests.getStatus(p, quest.id);
      if (status.complete) return 'Already completed.';
      if (status.started) return `Already started (step ${status.step + 1}).`;
      if (!quests.meetsRequirements(p, quest, getLevel)) return 'You don\'t meet the requirements.';
      quests.startQuest(p, quest.id);
      return `Quest started: ${quest.name}\n${quest.steps[0].text}`;
    }
  });

  commands.register('questadvance', { help: 'Advance quest step (debug)', category: 'Quests', admin: true,
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      const quest = [...quests.quests.values()].find(q => q.name.toLowerCase().includes(name));
      if (!quest) return 'Unknown quest.';
      const result = quests.advanceStep(p, quest.id);
      if (result === 'complete') {
        let msg = `Quest complete: ${quest.name}! +${quest.questPoints} QP`;
        if (quest.rewards.xp) {
          for (const [skill, xp] of Object.entries(quest.rewards.xp)) {
            addXp(p, skill, xp);
            msg += `\n  +${xp} ${skill} XP`;
          }
        }
        return msg;
      }
      if (result !== null) return `Step ${result + 1}: ${quest.steps[result].text}`;
      return 'Cannot advance.';
    }
  });

  // ── Slayer ──────────────────────────────────────────────────────────────────
  commands.register('task', { help: 'Show current slayer task', aliases: ['slayertask'], category: 'Combat',
    fn: (p) => {
      if (!p.slayerTask) return 'No slayer task. Talk to a slayer master with `slayer [master]`.';
      return `Slayer task: Kill ${p.slayerTask.remaining}/${p.slayerTask.count} ${p.slayerTask.monster}s. Streak: ${p.slayerStreak || 0}. Points: ${p.slayerPoints || 0}.`;
    }
  });

  commands.register('slayer', { help: 'Get slayer task: slayer [master]', category: 'Combat',
    fn: (p, args) => {
      const masterName = args.join(' ').toLowerCase() || 'turael';
      const master = [...slayer.masters.values()].find(m => m.name.toLowerCase() === masterName);
      if (!master) return `Unknown master: ${masterName}. Masters: ${[...slayer.masters.values()].map(m => m.name).join(', ')}`;
      if (p.slayerTask && p.slayerTask.remaining > 0) return `You already have a task: ${p.slayerTask.remaining} ${p.slayerTask.monster}s remaining.`;
      const task = slayer.assignTask(p, master.id, getLevel);
      if (!task) return 'No suitable tasks available.';
      p.slayerTask = task;
      return `${master.name}: "Your task is to kill ${task.count} ${task.monster}s."`;
    }
  });

  // ── Friends ─────────────────────────────────────────────────────────────────
  commands.register('friends', { help: 'Show friends list', aliases: ['fl'], category: 'Social',
    fn: (p) => {
      if (!p.friends) p.friends = [];
      if (!p.friends.length) return 'Friends list is empty. Use `friend add [name]`.';
      let out = 'Friends:\n';
      for (const name of p.friends) {
        const online = playersByName.has(name.toLowerCase());
        out += `  ${online ? '●' : '○'} ${name} ${online ? '(online)' : '(offline)'}\n`;
      }
      return out;
    }
  });

  commands.register('friend', { help: 'Add/remove friend: friend add/remove [name]', category: 'Social',
    fn: (p, args) => {
      if (!p.friends) p.friends = [];
      const action = args[0]?.toLowerCase();
      const name = args.slice(1).join(' ');
      if (action === 'add' && name) {
        if (p.friends.includes(name)) return 'Already on friends list.';
        if (p.friends.length >= 400) return 'Friends list full (400).';
        p.friends.push(name);
        return `Added ${name} to friends list.`;
      }
      if (action === 'remove' && name) {
        const idx = p.friends.findIndex(f => f.toLowerCase() === name.toLowerCase());
        if (idx < 0) return 'Not on friends list.';
        p.friends.splice(idx, 1);
        return `Removed ${name} from friends list.`;
      }
      return 'Usage: friend add [name] / friend remove [name]';
    }
  });

  // ── Ignore ──────────────────────────────────────────────────────────────────
  commands.register('ignore', { help: 'Ignore a player: ignore [name]', category: 'Social',
    fn: (p, args) => {
      if (!p.ignoreList) p.ignoreList = [];
      const name = args.join(' ');
      if (!name) return `Ignore list: ${p.ignoreList.join(', ') || 'empty'}`;
      if (p.ignoreList.includes(name.toLowerCase())) return 'Already ignored.';
      p.ignoreList.push(name.toLowerCase());
      return `Ignoring ${name}.`;
    }
  });

  commands.register('unignore', { help: 'Unignore a player', category: 'Social',
    fn: (p, args) => {
      if (!p.ignoreList) p.ignoreList = [];
      const name = args.join(' ').toLowerCase();
      const idx = p.ignoreList.indexOf(name);
      if (idx < 0) return 'Not on ignore list.';
      p.ignoreList.splice(idx, 1);
      return `Unignored ${name}.`;
    }
  });

  // ── Trade ───────────────────────────────────────────────────────────────────
  commands.register('trade', { help: 'Trade with player: trade [name]', category: 'Economy',
    fn: (p, args) => {
      const name = args.join(' ');
      const target = findPlayer(name);
      if (!target) return `Player "${name}" not found.`;
      if (target === p) return "You can't trade with yourself.";
      // Simplified: just show both inventories
      let out = `── Trade with ${target.name} ──\n`;
      out += `Your inventory:\n`;
      p.inventory.filter(s => s).forEach((s, i) => { out += `  ${s.name}${s.count > 1 ? ` x${s.count}` : ''}\n`; });
      out += `\nTheir inventory:\n`;
      target.inventory.filter(s => s).forEach((s, i) => { out += `  ${s.name}${s.count > 1 ? ` x${s.count}` : ''}\n`; });
      out += `\nUse \`give [player] [item]\` to transfer items directly (trust trade).`;
      return out;
    }
  });

  commands.register('giveto', { help: 'Give item to player: giveto [player] [item]', category: 'Economy',
    fn: (p, args) => {
      if (args.length < 2) return 'Usage: giveto [player] [item name]';
      const targetName = args[0];
      const itemName = args.slice(1).join(' ').toLowerCase();
      const target = findPlayer(targetName);
      if (!target) return `Player "${targetName}" not found.`;
      const slot = p.inventory.findIndex(s => s && s.name.toLowerCase() === itemName);
      if (slot < 0) return `You don't have "${itemName}".`;
      if (invFreeSlots(target) < 1) return `${target.name}'s inventory is full.`;
      const item = p.inventory[slot];
      p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
      invAdd(target, item.id, item.name, 1, items.get(item.id)?.stackable);
      // Notify target
      for (const [ws, pl] of players) {
        if (pl === target) { sendText(ws, `${p.name} gave you: ${item.name}`); break; }
      }
      return `Gave ${item.name} to ${target.name}.`;
    }
  });

  // ── Death system ────────────────────────────────────────────────────────────
  // Already handled in combatTick, but add respawn info
  commands.register('death', { help: 'Show death rules', category: 'General',
    fn: (p) => {
      return 'Death rules:\n  - You keep your 3 most valuable items.\n  - Other items appear at your gravestone for 15 minutes.\n  - Respawn at last home location.\n  - Protect Item prayer: keep 1 extra item.';
    }
  });

  // ── Hiscores ────────────────────────────────────────────────────────────────
  commands.register('hiscores', { help: 'Show skill rankings', aliases: ['hs', 'ranks'], category: 'General',
    fn: (p, args) => {
      const skill = args[0]?.toLowerCase() || 'total';
      // Collect all saved player data
      const fs = require('fs');
      const path = require('path');
      const playersDir = path.join(persistence.DATA_DIR, 'players');
      if (!fs.existsSync(playersDir)) return 'No hiscores data.';
      const allPlayers = [];
      // Include online players
      for (const pl of playersByName.values()) {
        allPlayers.push({ name: pl.name, skills: pl.skills });
      }
      if (skill === 'total') {
        allPlayers.sort((a, b) => {
          const ta = Object.values(b.skills).reduce((s, sk) => s + sk.level, 0);
          const tb = Object.values(a.skills).reduce((s, sk) => s + sk.level, 0);
          return ta - tb;
        });
        let out = '── Hiscores (Total Level) ──\n';
        allPlayers.slice(0, 20).forEach((pl, i) => {
          const total = Object.values(pl.skills).reduce((s, sk) => s + sk.level, 0);
          out += `  ${i + 1}. ${pl.name} — ${total}\n`;
        });
        return out;
      }
      if (!allPlayers[0]?.skills[skill]) return `Unknown skill: ${skill}`;
      allPlayers.sort((a, b) => (b.skills[skill]?.xp || 0) - (a.skills[skill]?.xp || 0));
      let out = `── Hiscores (${skill}) ──\n`;
      allPlayers.slice(0, 20).forEach((pl, i) => {
        out += `  ${i + 1}. ${pl.name} — Level ${pl.skills[skill]?.level || 1} (${(pl.skills[skill]?.xp || 0).toLocaleString()} XP)\n`;
      });
      return out;
    }
  });

  // ── Emotes ──────────────────────────────────────────────────────────────────
  const EMOTES = ['wave', 'bow', 'dance', 'clap', 'cry', 'laugh', 'think', 'shrug', 'yes', 'no',
    'angry', 'cheer', 'beckon', 'panic', 'sit', 'push-up', 'headbang', 'salute', 'stomp', 'flex',
    'spin', 'yawn', 'stretch', 'blow kiss', 'jig', 'goblin bow', 'goblin salute'];

  commands.register('emote', { help: 'Perform emote: emote [name]', category: 'Social',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) return 'Emotes: ' + EMOTES.join(', ');
      if (!EMOTES.includes(name)) return `Unknown emote. Available: ${EMOTES.join(', ')}`;
      broadcast({ t: 'emote', from: p.name, emote: name });
      return `You perform the ${name} emote.`;
    }
  });

  // ── World info ──────────────────────────────────────────────────────────────
  commands.register('world', { help: 'Show world info', category: 'General',
    fn: () => {
      return `World 1 — Scape\nPlayers: ${playersByName.size}\nTick: ${tick.getTick()}\nUptime: ${Math.floor(tick.getTick() * 0.6)}s`;
    }
  });

  // ── Recipes browser ─────────────────────────────────────────────────────────
  commands.register('recipes', { help: 'Browse recipes: recipes [skill]', category: 'Skills',
    fn: (p, args) => {
      const skill = args[0]?.toLowerCase();
      if (!skill) return 'Usage: recipes [cooking/smithing/crafting/fletching/herblore/firemaking]';
      const list = recipes.forSkill(skill);
      if (!list.length) return `No recipes for ${skill}.`;
      let out = `── ${skill} recipes ──\n`;
      for (const r of list) {
        const canMake = getLevel(p, skill) >= r.level;
        const inputs = r.inputs.map(i => `${i.count}x ${items.get(i.id)?.name || '?'}`).join(' + ');
        const outputs = r.outputs.length ? r.outputs.map(o => `${o.count}x ${items.get(o.id)?.name || '?'}`).join(', ') : '(none)';
        out += `  ${canMake ? '✓' : '✕'} ${r.name} — ${inputs} → ${outputs} (lvl ${r.level}, ${r.xp} XP)\n`;
      }
      return out;
    }
  });

  // ── Rest (run energy recovery) ──────────────────────────────────────────────
  commands.register('rest', { help: 'Rest to recover run energy faster', category: 'Navigation',
    fn: (p) => {
      p.runEnergy = Math.min(10000, p.runEnergy + 2000);
      return `You rest for a moment. Energy: ${(p.runEnergy / 100).toFixed(0)}%`;
    }
  });

  // ── Home teleport ───────────────────────────────────────────────────────────
  commands.register('home', { help: 'Teleport home (to spawn)', category: 'Navigation',
    fn: (p) => {
      p.x = 100; p.y = 100; p.layer = 0; p.path = [];
      return 'You teleport home to Spawn Island.';
    }
  });

  // ── Agility ────────────────────────────────────────────────────────────────
  commands.register('cross', { help: 'Cross an agility obstacle: cross [obstacle]', aliases: ['climb', 'jump', 'balance'], category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) return 'Usage: cross [obstacle]. Look around for agility obstacles.';

      let foundCourse = null, foundObstacle = null, foundIdx = -1;
      for (const [courseId, course] of Object.entries(AGILITY_COURSES)) {
        for (let i = 0; i < course.obstacles.length; i++) {
          const obs = course.obstacles[i];
          // Match by obstacle name or definition id (e.g. "wall", "low wall", "agility_wall")
          const obsLower = obs.name.toLowerCase();
          const defLower = (obs.defId || '').toLowerCase().replace(/_/g, ' ');
          if (obsLower.includes(name) || obsLower === name || defLower.includes(name) || name.includes(obsLower)) {
            const dist = Math.max(Math.abs(p.x - obs.x), Math.abs(p.y - obs.y));
            if (dist <= 10) { foundCourse = { id: courseId, ...course }; foundObstacle = obs; foundIdx = i; break; }
          }
        }
        if (foundObstacle) break;
      }

      if (!foundObstacle) return `No obstacle called "${name}" nearby.`;
      if (getLevel(p, 'agility') < foundCourse.levelReq) return `You need Agility level ${foundCourse.levelReq}.`;
      if (p.busy) actions.cancel(p);

      actions.start(p, {
        type: 'agility',
        ticks: 3,
        repeat: false,
        data: { player: p, course: foundCourse, obstacle: foundObstacle, obstacleIdx: foundIdx },
        onComplete: (data) => {
          const pl = data.player;
          const lvl = addXp(pl, 'agility', data.obstacle.xp);
          if (!pl.agilityLap || pl.agilityLap.courseId !== data.course.id) {
            pl.agilityLap = { courseId: data.course.id, obstaclesDone: new Set() };
          }
          pl.agilityLap.obstaclesDone.add(data.obstacleIdx);
          let msg = `You cross the ${data.obstacle.name}.${xpDrop('agility', data.obstacle.xp)}`;
          if (lvl) msg += levelUpMsg('agility', lvl);
          if (pl.agilityLap.obstaclesDone.size >= data.course.obstacles.length) {
            const lapLvl = addXp(pl, 'agility', data.course.lapBonus);
            msg += `\nLap complete!${xpDrop('agility', data.course.lapBonus)}`;
            if (lapLvl) msg += levelUpMsg('agility', lapLvl);
            events.emit('skill_action', { player: pl, skill: 'agility' });
            pl.agilityLap = null;
          } else {
            msg += ` (${pl.agilityLap.obstaclesDone.size}/${data.course.obstacles.length} obstacles)`;
          }
          return msg;
        },
      });
      return `You attempt to cross the ${foundObstacle.name}...`;
    }
  });

  // ── Thieving ───────────────────────────────────────────────────────────────
  commands.register('pickpocket', { help: 'Pickpocket an NPC: pickpocket [npc]', aliases: ['steal'], category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ');
      if (!name) return 'Usage: pickpocket [npc name]';
      if (p.stunTicks > 0) return `You are stunned! (${p.stunTicks} ticks remaining)`;

      const npc = npcs.findNpcByName(name, p.x, p.y, 10, p.layer);
      if (!npc) return `No "${name}" nearby. Type \`nearby\` to see who's around.`;

      const npcDef = npcs.npcDefs.get(npc.defId);
      if (!npcDef || !npcDef.thieving) return `You can't pickpocket the ${npc.name}.`;

      const thieving = npcDef.thieving;
      if (getLevel(p, 'thieving') < thieving.level) return `You need Thieving level ${thieving.level}.`;

      const levelDiff = getLevel(p, 'thieving') - thieving.level;
      const successChance = Math.min(0.95, 0.5 + levelDiff * 0.02);

      if (Math.random() < successChance) {
        const loot = thieving.loot[Math.floor(Math.random() * thieving.loot.length)];
        const count = loot.min + Math.floor(Math.random() * (loot.max - loot.min + 1));
        const itemDef = items.get(loot.id);
        invAdd(p, loot.id, loot.name, count, itemDef?.stackable);
        const lvl = addXp(p, 'thieving', thieving.xp);
        updateWeight(p);
        let msg = `You pick the ${npc.name}'s pocket. Got: ${loot.name} x${count}.${xpDrop('thieving', thieving.xp)}`;
        if (lvl) msg += levelUpMsg('thieving', lvl);
        events.emit('skill_action', { player: p, skill: 'thieving' });
        return msg;
      } else {
        const dmg = 1 + Math.floor(Math.random() * (thieving.stunDamage || 2));
        p.hp = Math.max(0, p.hp - dmg);
        p.stunTicks = 4;
        let msg = `You fail to pickpocket the ${npc.name}! They hit you for ${dmg}. HP: ${p.hp}/${p.maxHp}. Stunned for 4 ticks!`;
        if (p.hp <= 0) {
          msg += '\nOh dear, you are dead!';
          p.hp = p.maxHp; p.x = 100; p.y = 100; p.layer = 0; p.path = []; p.stunTicks = 0;
        }
        return msg;
      }
    }
  });

  // ── Potion Drinking ────────────────────────────────────────────────────────
  commands.register('drink', { help: 'Drink a potion: drink [potion]', category: 'Items',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) return 'Usage: drink [potion name]';
      const slot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes(name));
      if (slot < 0) return `You don't have "${name}".`;
      const item = p.inventory[slot];
      const def = items.get(item.id);
      if (!def || def.category !== 'potion') return `You can't drink ${item.name}.`;

      p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
      if (!p.boosts) p.boosts = {};
      const potionName = item.name.toLowerCase();
      let msg = `You drink the ${item.name}.`;

      if (potionName.includes('super attack')) {
        const boost = 5 + Math.floor(getLevel(p, 'attack') * 0.15);
        p.boosts.attack = { amount: boost, ticksLeft: 90 };
        msg += ` Attack boosted by +${boost} for 90 ticks.`;
      } else if (potionName.includes('super strength')) {
        const boost = 5 + Math.floor(getLevel(p, 'strength') * 0.15);
        p.boosts.strength = { amount: boost, ticksLeft: 90 };
        msg += ` Strength boosted by +${boost} for 90 ticks.`;
      } else if (potionName.includes('attack')) {
        const boost = 3 + Math.floor(getLevel(p, 'attack') * 0.1);
        p.boosts.attack = { amount: boost, ticksLeft: 90 };
        msg += ` Attack boosted by +${boost} for 90 ticks.`;
      } else if (potionName.includes('strength')) {
        const boost = 3 + Math.floor(getLevel(p, 'strength') * 0.1);
        p.boosts.strength = { amount: boost, ticksLeft: 90 };
        msg += ` Strength boosted by +${boost} for 90 ticks.`;
      } else if (potionName.includes('defence')) {
        const boost = 3 + Math.floor(getLevel(p, 'defence') * 0.1);
        p.boosts.defence = { amount: boost, ticksLeft: 90 };
        msg += ` Defence boosted by +${boost} for 90 ticks.`;
      } else if (potionName.includes('prayer')) {
        const restore = Math.floor(7 + getLevel(p, 'prayer') / 4);
        p.prayerPoints = Math.min(getLevel(p, 'prayer'), p.prayerPoints + restore);
        msg += ` Prayer restored by ${restore}. Prayer: ${p.prayerPoints}/${getLevel(p, 'prayer')}.`;
      } else if (potionName.includes('restore')) {
        if (p.boosts) for (const [sk, b] of Object.entries(p.boosts)) { if (b.amount < 0) delete p.boosts[sk]; }
        msg += ' Your stats have been restored.';
      } else if (potionName.includes('antipoison')) {
        p.poison = null;
        msg += ' You have been cured of poison.';
      } else {
        msg += ' Nothing interesting happens.';
      }

      invAdd(p, 325, 'Vial', 1);
      updateWeight(p);
      return msg;
    }
  });

  // ── Weight ─────────────────────────────────────────────────────────────────
  commands.register('weight', { help: 'Show your carry weight', category: 'General',
    fn: (p) => {
      updateWeight(p);
      return `Weight: ${p.weight.toFixed(1)} kg`;
    }
  });

  // ── Map Command ───────────────────────────────────────────────────────────
  function generateMap(p) {
      const T = tiles.T;
      const RADIUS = 7; // 15x15 grid = radius 7
      const TILE_CHARS = {
        [T.EMPTY]: 'X', [T.GRASS]: '.', [T.WATER]: '~', [T.TREE]: 'T',
        [T.PATH]: '=', [T.ROCK]: '#', [T.SAND]: 'S', [T.WALL]: '#',
        [T.FLOOR]: '.', [T.DOOR]: 'D', [T.BRIDGE]: '=', [T.FISH_SPOT]: '~',
        [T.FLOWER]: ',', [T.BUSH]: 'b', [T.DARK_GRASS]: '.', [T.SNOW]: '*',
        [T.LAVA]: '!', [T.SWAMP]: '%',
      };

      // Build sets of NPC and object positions for quick lookup
      const npcPositions = new Map();
      const nearNpcs = npcs.getNpcsNear(p.x, p.y, RADIUS, p.layer);
      for (const n of nearNpcs) npcPositions.set(`${n.x},${n.y}`, n);

      const objPositions = new Map();
      const nearObjs = objects.getObjectsNear(p.x, p.y, RADIUS, p.layer);
      for (const o of nearObjs) if (!o.depleted) objPositions.set(`${o.x},${o.y}`, o);

      const playerPositions = new Map();
      for (const [, pl] of players) {
        if (pl !== p && pl.connected && pl.layer === p.layer &&
            Math.abs(pl.x - p.x) <= RADIUS && Math.abs(pl.y - p.y) <= RADIUS) {
          playerPositions.set(`${pl.x},${pl.y}`, pl);
        }
      }

      let map = '    ';
      // Column headers
      for (let dx = -RADIUS; dx <= RADIUS; dx++) {
        map += (dx === 0) ? 'v' : ' ';
      }
      map += '\n';

      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        const worldY = p.y + dy;
        map += (dy === 0) ? ' > ' : '   ';
        map += ' ';
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const worldX = p.x + dx;
          const key = `${worldX},${worldY}`;

          if (dx === 0 && dy === 0) {
            map += '@'; // Player
          } else if (playerPositions.has(key)) {
            map += 'P';
          } else if (npcPositions.has(key)) {
            map += '!';
          } else if (objPositions.has(key)) {
            map += '?';
          } else {
            const tile = tiles.tileAt(worldX, worldY, p.layer);
            map += TILE_CHARS[tile] || 'X';
          }
        }
        map += '\n';
      }

      map += '\nLegend: @ You  ! NPC  ? Object  P Player  # Wall/Rock  T Tree';
      map += '\n        ~ Water  . Grass/Floor  = Path  S Sand  D Door  X Unwalkable';
      const area = tiles.getArea(p.x, p.y, p.layer);
      if (area) map += `\nArea: ${area.name}`;
      return map;
  }

  // Expose for use by movement commands
  ctx.generateMap = generateMap;

  commands.register('map', { help: 'Show ASCII map of surroundings (15x15)', category: 'Navigation',
    fn: (p) => generateMap(p)
  });

  // ── Nearby Command ────────────────────────────────────────────────────────
  commands.register('nearby', { help: 'List everything within 10 tiles', category: 'Navigation',
    fn: (p) => {
      const RANGE = 10;
      let out = `=== Nearby (within ${RANGE} tiles) ===`;

      // NPCs
      const nearNpcs = npcs.getNpcsNear(p.x, p.y, RANGE, p.layer);
      if (nearNpcs.length) {
        out += '\n\n-- NPCs --';
        for (const n of nearNpcs) {
          const dist = Math.max(Math.abs(n.x - p.x), Math.abs(n.y - p.y));
          const dir = getDirection(p.x, p.y, n.x, n.y);
          out += `\n  ${n.name} (lvl ${n.combat}) - ${dist} tiles ${dir} (${n.x},${n.y})`;
        }
      }

      // Objects
      const nearObjs = objects.getObjectsNear(p.x, p.y, RANGE, p.layer);
      const activeObjs = nearObjs.filter(o => !o.depleted);
      if (activeObjs.length) {
        out += '\n\n-- Objects --';
        for (const o of activeObjs) {
          const dist = Math.max(Math.abs(o.x - p.x), Math.abs(o.y - p.y));
          const dir = getDirection(p.x, p.y, o.x, o.y);
          out += `\n  ${o.name} - ${dist} tiles ${dir} (${o.x},${o.y})`;
        }
      }

      // Ground items
      const nearItems = groundItems.filter(i =>
        Math.abs(i.x - p.x) <= RANGE && Math.abs(i.y - p.y) <= RANGE && i.layer === p.layer
      );
      if (nearItems.length) {
        out += '\n\n-- Items --';
        for (const i of nearItems) {
          const dist = Math.max(Math.abs(i.x - p.x), Math.abs(i.y - p.y));
          const dir = getDirection(p.x, p.y, i.x, i.y);
          out += `\n  ${i.name} x${i.count} - ${dist} tiles ${dir} (${i.x},${i.y})`;
        }
      }

      // Players
      const nearPlayers = [];
      for (const [, pl] of players) {
        if (pl !== p && pl.connected && pl.layer === p.layer &&
            Math.abs(pl.x - p.x) <= RANGE && Math.abs(pl.y - p.y) <= RANGE) {
          nearPlayers.push(pl);
        }
      }
      if (nearPlayers.length) {
        out += '\n\n-- Players --';
        for (const pl of nearPlayers) {
          const dist = Math.max(Math.abs(pl.x - p.x), Math.abs(pl.y - p.y));
          const dir = getDirection(p.x, p.y, pl.x, pl.y);
          out += `\n  ${pl.name} (combat ${combatLevel(pl)}) - ${dist} tiles ${dir}`;
        }
      }

      // Exits / paths to other areas
      const currentArea = tiles.getArea(p.x, p.y, p.layer);
      const areasSeen = new Set();
      if (currentArea) areasSeen.add(currentArea.id);
      const exits = [];
      for (let dx = -RANGE; dx <= RANGE; dx++) {
        for (let dy = -RANGE; dy <= RANGE; dy++) {
          const wx = p.x + dx, wy = p.y + dy;
          const a = tiles.getArea(wx, wy, p.layer);
          if (a && !areasSeen.has(a.id)) {
            areasSeen.add(a.id);
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            const dir = getDirection(p.x, p.y, wx, wy);
            exits.push({ name: a.name, dist, dir });
          }
        }
      }
      if (exits.length) {
        out += '\n\n-- Exits / Nearby Areas --';
        exits.sort((a, b) => a.dist - b.dist);
        for (const e of exits) {
          out += `\n  ${e.name} - ${e.dist} tiles ${e.dir}`;
        }
      }

      return out;
    }
  });

  // Direction helper for nearby/map
  function getDirection(fromX, fromY, toX, toY) {
    const dx = toX - fromX, dy = toY - fromY;
    if (dx === 0 && dy === 0) return 'here';
    let dir = '';
    if (dy < 0) dir += 'N';
    if (dy > 0) dir += 'S';
    if (dx < 0) dir += 'W';
    if (dx > 0) dir += 'E';
    return dir;
  }

  // ── Status Command ────────────────────────────────────────────────────────
  commands.register('status', { help: 'Show detailed player status', category: 'General',
    fn: (p) => {
      updateWeight(p);
      const cb = combatLevel(p);
      let out = '=== Status ===';
      out += `\nHP: ${p.hp}/${p.maxHp}`;
      out += `\nPrayer: ${p.prayerPoints}/${getLevel(p, 'prayer')}`;
      out += `\nRun Energy: ${(p.runEnergy / 100).toFixed(0)}%${p.running ? ' (running)' : ''}`;
      out += `\nWeight: ${p.weight.toFixed(1)} kg`;
      out += `\nCombat Level: ${cb}`;
      out += `\nSpecial Attack: ${(p.specialEnergy / 10).toFixed(0)}%`;

      // Current action
      if (p.busy && p.busyAction) {
        out += `\nCurrent Action: ${p.busyAction}`;
      } else if (p.combatTarget) {
        const npc = npcs.getNpc(p.combatTarget);
        out += `\nCurrent Action: Fighting ${npc ? npc.name : 'unknown'}`;
      } else if (p.pvpTarget) {
        out += `\nCurrent Action: PvP combat`;
      } else if (p.path.length > 0) {
        out += `\nCurrent Action: Walking (${p.path.length} steps remaining)`;
      }

      // Active boosts
      if (p.boosts && Object.keys(p.boosts).length > 0) {
        out += '\nActive Boosts:';
        for (const [skill, boost] of Object.entries(p.boosts)) {
          if (boost.ticksLeft > 0) {
            out += `\n  ${skill}: +${boost.amount} (${boost.ticksLeft} ticks left)`;
          }
        }
      }

      // Active prayers
      if (p.activePrayers && p.activePrayers.size > 0) {
        out += `\nActive Prayers: ${[...p.activePrayers].join(', ')}`;
      }

      // Slayer task
      if (p.slayerTask) {
        out += `\nSlayer Task: ${p.slayerTask.monster} (${p.slayerTask.remaining} remaining)`;
      }

      // Wilderness level
      if (p.y <= 55) {
        const wildyLevel = 55 - p.y;
        out += `\nWilderness Level: ${wildyLevel} (PvP enabled!)`;
      }

      // Skull timer
      if (p.skull > 0) {
        out += `\nSkull Timer: ${p.skull} ticks remaining`;
      }

      // Stun
      if (p.stunTicks > 0) {
        out += `\nStunned: ${p.stunTicks} ticks remaining`;
      }

      // Position and area
      out += `\nPosition: (${p.x}, ${p.y}) Layer ${p.layer}`;
      const area = tiles.getArea(p.x, p.y, p.layer);
      if (area) out += `\nArea: ${area.name}`;

      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // FARMING (feature 2)
  // ══════════════════════════════════════════════════════════════════════════
  const SEED_DATA = {
    600: { name: 'guam', herbId: 300, herbName: 'Grimy guam', level: 9, xp: 11, stages: 4 },
    601: { name: 'marrentill', herbId: 301, herbName: 'Grimy marrentill', level: 14, xp: 13.5, stages: 4 },
    602: { name: 'ranarr', herbId: 304, herbName: 'Grimy ranarr', level: 32, xp: 26.5, stages: 4 },
  };

  commands.register('plant', { help: 'Plant a seed in a patch: plant [seed] in [patch]', category: 'Skills',
    fn: (p, args) => {
      const full = args.join(' ').toLowerCase();
      const match = full.match(/^(.+?)\s+in\s+(.+)$/);
      if (!match) return 'Usage: plant [seed] in [patch]. E.g., plant guam seed in herb patch';
      const seedName = match[1].trim();
      const patchName = match[2].trim();
      // Find the patch
      const obj = objects.findObjectByName(patchName, p.x, p.y, 3, p.layer);
      if (!obj) return `No "${patchName}" nearby.`;
      if (obj.defId !== 'herb_patch') return `You can't plant in the ${obj.name}.`;
      const patchKey = `${obj.layer}_${obj.x}_${obj.y}`;
      if (!p.farmingPatches) p.farmingPatches = {};
      if (p.farmingPatches[patchKey] && p.farmingPatches[patchKey].stage < p.farmingPatches[patchKey].maxStage) {
        return 'Something is already growing in this patch.';
      }
      // Find seed
      const slot = p.inventory.findIndex(s => s && s.name.toLowerCase().includes(seedName));
      if (slot < 0) return `You don't have any "${seedName}".`;
      const item = p.inventory[slot];
      const seedInfo = SEED_DATA[item.id];
      if (!seedInfo) return `${item.name} is not a plantable seed.`;
      if (getLevel(p, 'farming') < seedInfo.level) return `You need Farming level ${seedInfo.level}.`;
      p.inventory[slot] = item.count > 1 ? { ...item, count: item.count - 1 } : null;
      updateWeight(p);
      p.farmingPatches[patchKey] = {
        seedId: item.id, seedName: seedInfo.name, herbId: seedInfo.herbId, herbName: seedInfo.herbName,
        stage: 0, maxStage: seedInfo.stages, xp: seedInfo.xp, diseased: false,
      };
      const lvl = addXp(p, 'farming', seedInfo.xp);
      let msg = `You plant the ${item.name} in the patch.${xpDrop('farming', seedInfo.xp)}`;
      if (lvl) msg += levelUpMsg('farming', lvl);
      return msg;
    }
  });

  commands.register('harvest', { help: 'Harvest a patch: harvest [patch]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase() || 'herb patch';
      const obj = objects.findObjectByName(name, p.x, p.y, 3, p.layer);
      if (!obj) return `No "${name}" nearby.`;
      const patchKey = `${obj.layer}_${obj.x}_${obj.y}`;
      if (!p.farmingPatches) p.farmingPatches = {};
      const patch = p.farmingPatches[patchKey];
      if (!patch) return 'Nothing is planted here.';
      if (patch.diseased) return 'This patch is diseased! It needs to be cleared. Use `inspect` to see details.';
      if (patch.stage < patch.maxStage) return `The ${patch.seedName} is still growing (stage ${patch.stage}/${patch.maxStage}).`;
      if (invFreeSlots(p) < 1) return 'Your inventory is full.';
      const produce = 3 + Math.floor(Math.random() * 13); // 3-15
      const itemDef = items.get(patch.herbId);
      const added = Math.min(produce, invFreeSlots(p));
      for (let i = 0; i < added; i++) invAdd(p, patch.herbId, patch.herbName, 1);
      const harvestXp = patch.xp * 5;
      const lvl = addXp(p, 'farming', harvestXp);
      updateWeight(p);
      delete p.farmingPatches[patchKey];
      let msg = `You harvest ${added}x ${patch.herbName} from the patch.${xpDrop('farming', harvestXp)}`;
      if (lvl) msg += levelUpMsg('farming', lvl);
      return msg;
    }
  });

  commands.register('inspect', { help: 'Inspect a farming patch: inspect [patch]', category: 'Skills',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      // Check if it's a trap check
      if (name === 'trap' || name === 'traps') {
        return commands.execute(p, 'checktrap');
      }
      if (!name || name === 'herb patch') {
        // Find nearby herb patches
        const nearObjs = objects.getObjectsNear(p.x, p.y, 5, p.layer);
        const patches = nearObjs.filter(o => o.defId === 'herb_patch');
        if (!patches.length) {
          // Fall through to examine
          const npc = npcs.findNpcByName(name, p.x, p.y, 15, p.layer);
          if (npc) return `${npc.name}: ${npc.examine} (Combat: ${npc.combat})`;
          const obj = objects.findObjectByName(name, p.x, p.y, 15, p.layer);
          if (obj) return `${obj.name}: ${obj.examine}`;
          return 'No herb patches nearby.';
        }
        if (!p.farmingPatches) p.farmingPatches = {};
        let out = 'Farming patches:\n';
        for (const patch of patches) {
          const key = `${patch.layer}_${patch.x}_${patch.y}`;
          const data = p.farmingPatches[key];
          if (!data) {
            out += `  ${patch.name} at (${patch.x}, ${patch.y}) — Empty\n`;
          } else if (data.diseased) {
            out += `  ${patch.name} at (${patch.x}, ${patch.y}) — ${data.seedName} (DISEASED)\n`;
          } else if (data.stage >= data.maxStage) {
            out += `  ${patch.name} at (${patch.x}, ${patch.y}) — ${data.seedName} (Ready to harvest!)\n`;
          } else {
            out += `  ${patch.name} at (${patch.x}, ${patch.y}) — ${data.seedName} (stage ${data.stage}/${data.maxStage})\n`;
          }
        }
        return out;
      }
      // Default: examine
      const npc = npcs.findNpcByName(name, p.x, p.y, 15, p.layer);
      if (npc) return `${npc.name}: ${npc.examine} (Combat: ${npc.combat})`;
      const obj = objects.findObjectByName(name, p.x, p.y, 15, p.layer);
      if (obj) return `${obj.name}: ${obj.examine}`;
      return `Nothing called "${name}" nearby.`;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // HUNTER (feature 3)
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('trap', { help: 'Place a trap: trap [bird snare / box trap]', category: 'Skills',
    fn: (p, args) => {
      const type = args.join(' ').toLowerCase();
      if (!type) return 'Usage: trap [bird snare / box trap]';
      const trapLimit = 1 + Math.floor(getLevel(p, 'hunter') / 20);
      if (!p.traps) p.traps = [];
      if (p.traps.length >= trapLimit) return `You can only have ${trapLimit} traps placed (Hunter level ${getLevel(p, 'hunter')}).`;

      if (type === 'bird snare') {
        const slot = p.inventory.findIndex(s => s && s.id === 610);
        if (slot < 0) return 'You need a bird snare in your inventory.';
        p.inventory[slot] = p.inventory[slot].count > 1 ? { ...p.inventory[slot], count: p.inventory[slot].count - 1 } : null;
        updateWeight(p);
        p.traps.push({ type: 'bird snare', x: p.x, y: p.y, layer: p.layer, placedTick: tick.getTick(), caught: null, xp: 0 });
        return `You set up a bird snare at (${p.x}, ${p.y}). Traps: ${p.traps.length}/${trapLimit}`;
      } else if (type === 'box trap') {
        if (getLevel(p, 'hunter') < 53) return 'You need Hunter level 53 to use a box trap.';
        const slot = p.inventory.findIndex(s => s && s.id === 611);
        if (slot < 0) return 'You need a box trap in your inventory.';
        p.inventory[slot] = p.inventory[slot].count > 1 ? { ...p.inventory[slot], count: p.inventory[slot].count - 1 } : null;
        updateWeight(p);
        p.traps.push({ type: 'box trap', x: p.x, y: p.y, layer: p.layer, placedTick: tick.getTick(), caught: null, xp: 0 });
        return `You set up a box trap at (${p.x}, ${p.y}). Traps: ${p.traps.length}/${trapLimit}`;
      }
      return 'Unknown trap type. Use: bird snare, box trap';
    }
  });

  commands.register('checktrap', { help: 'Check your traps for catches', category: 'Skills',
    fn: (p) => {
      if (!p.traps || !p.traps.length) return 'You have no traps placed.';
      let out = 'Your traps:\n';
      let collectedAny = false;
      for (let i = p.traps.length - 1; i >= 0; i--) {
        const trap = p.traps[i];
        if (trap.caught) {
          // Collect the catch
          const lvl = addXp(p, 'hunter', trap.xp);
          if (trap.type === 'bird snare') {
            invAdd(p, 612, 'Raw bird meat', 1);
            invAdd(p, 614, 'Bird feather', 5, true);
            invAdd(p, 610, 'Bird snare', 1); // return trap
          } else if (trap.type === 'box trap') {
            invAdd(p, 613, 'Chinchompa', 1, true);
            invAdd(p, 611, 'Box trap', 1); // return trap
          }
          updateWeight(p);
          out += `  ${trap.type} at (${trap.x}, ${trap.y}) — Caught ${trap.caught}!${xpDrop('hunter', trap.xp)}`;
          if (lvl) out += levelUpMsg('hunter', lvl);
          out += '\n';
          p.traps.splice(i, 1);
          collectedAny = true;
        } else {
          const elapsed = tick.getTick() - trap.placedTick;
          out += `  ${trap.type} at (${trap.x}, ${trap.y}) — Waiting... (${elapsed} ticks)\n`;
        }
      }
      if (collectedAny && p.traps.length === 0) out += 'All traps collected.';
      return out;
    }
  });

  commands.register('check', { help: 'Check trap: check trap', category: 'Skills',
    fn: (p, args) => {
      const what = args.join(' ').toLowerCase();
      if (what === 'trap' || what === 'traps' || what === '') {
        return commands.execute(p, 'checktrap');
      }
      // Fall through to inspect for patches
      return commands.execute(p, 'inspect ' + what);
    }
  });

  commands.register('traps', { help: 'List your active traps', category: 'Skills',
    fn: (p) => {
      if (!p.traps || !p.traps.length) return 'You have no traps placed.';
      const trapLimit = 1 + Math.floor(getLevel(p, 'hunter') / 20);
      let out = `Traps: ${p.traps.length}/${trapLimit}\n`;
      for (const trap of p.traps) {
        const status = trap.caught ? `CAUGHT ${trap.caught}!` : 'waiting...';
        out += `  ${trap.type} at (${trap.x}, ${trap.y}) — ${status}\n`;
      }
      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TELEPORT SPELLS (feature 8)
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('cast', { help: 'Cast a spell: cast [spell name]', category: 'Magic',
    fn: (p, args) => {
      const spell = args.join(' ').toLowerCase();
      if (!spell) return 'Spells: home teleport, varrock teleport, lumbridge teleport';

      if (spell === 'home teleport') {
        if (p.busy) actions.cancel(p);
        actions.start(p, {
          type: 'magic',
          ticks: 16,
          repeat: false,
          data: { player: p },
          onTick: (data, ticksLeft) => {
            if (ticksLeft === 15) return 'You begin casting Home Teleport...';
            if (ticksLeft === 8) return 'The teleport spell builds...';
            return null;
          },
          onComplete: (data) => {
            const pl = data.player;
            pl.x = 100; pl.y = 100; pl.layer = 0; pl.path = [];
            return 'You teleport home to Spawn Island.';
          },
        });
        return 'Casting Home Teleport... (16 ticks, stand still!)';
      }

      if (spell === 'varrock teleport') {
        if (getLevel(p, 'magic') < 25) return 'You need Magic level 25.';
        if (invCount(p, 279) < 1) return 'You need 1 law rune.';
        if (invCount(p, 270) < 3) return 'You need 3 air runes.';
        if (invCount(p, 273) < 1) return 'You need 1 fire rune.';
        if (p.busy) actions.cancel(p);
        actions.start(p, {
          type: 'magic',
          ticks: 3,
          repeat: false,
          data: { player: p },
          onComplete: (data) => {
            const pl = data.player;
            invRemove(pl, 279, 1); invRemove(pl, 270, 3); invRemove(pl, 273, 1);
            const lvl = addXp(pl, 'magic', 35);
            updateWeight(pl);
            pl.x = 100; pl.y = 88; pl.layer = 0; pl.path = [];
            let msg = `You teleport to Town!${xpDrop('magic', 35)}`;
            if (lvl) msg += levelUpMsg('magic', lvl);
            return msg;
          },
        });
        return 'Casting Varrock Teleport...';
      }

      if (spell === 'lumbridge teleport') {
        if (getLevel(p, 'magic') < 31) return 'You need Magic level 31.';
        if (invCount(p, 279) < 1) return 'You need 1 law rune.';
        if (invCount(p, 270) < 3) return 'You need 3 air runes.';
        if (invCount(p, 272) < 1) return 'You need 1 earth rune.';
        if (p.busy) actions.cancel(p);
        actions.start(p, {
          type: 'magic',
          ticks: 3,
          repeat: false,
          data: { player: p },
          onComplete: (data) => {
            const pl = data.player;
            invRemove(pl, 279, 1); invRemove(pl, 270, 3); invRemove(pl, 272, 1);
            const lvl = addXp(pl, 'magic', 41);
            updateWeight(pl);
            pl.x = 100; pl.y = 100; pl.layer = 0; pl.path = [];
            let msg = `You teleport to Lumbridge!${xpDrop('magic', 41)}`;
            if (lvl) msg += levelUpMsg('magic', lvl);
            return msg;
          },
        });
        return 'Casting Lumbridge Teleport...';
      }

      return `Unknown spell: "${spell}". Spells: home teleport, varrock teleport, lumbridge teleport`;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // EXAMINE SELF (feature 12)
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('examine', { help: 'Examine something: examine [target] or examine self', category: 'World',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) return 'Usage: examine [target] or examine self';

      if (name === 'self' || name === 'me' || name === 'myself') {
        const cb = combatLevel(p);
        const tl = totalLevel(p);
        let totalXp = 0;
        const { SKILLS } = require('../player/player');
        for (const s of SKILLS) totalXp += getXp(p, s);
        const ticksPlayed = tick.getTick() - (p.loginTick || 0);
        const secondsPlayed = Math.floor(ticksPlayed * 0.6);
        const minutesPlayed = Math.floor(secondsPlayed / 60);

        // Bank value estimate
        let bankValue = 0;
        if (p.bank) {
          for (const b of p.bank) {
            const def = items.get(b.id);
            bankValue += (def?.value || 0) * (b.count || 1);
          }
        }

        let out = `══ ${p.name} ══\n`;
        out += `Combat Level: ${cb} | Total Level: ${tl}\n`;
        out += `HP: ${p.hp}/${p.maxHp} | Prayer: ${p.prayerPoints}/${getLevel(p, 'prayer')}\n\n`;
        out += '── Skills ──\n';
        // Format in 2 columns
        for (let i = 0; i < SKILLS.length; i += 2) {
          const s1 = SKILLS[i];
          const l1 = getLevel(p, s1);
          const col1 = `${s1.padEnd(14)} ${String(l1).padStart(3)}`;
          if (i + 1 < SKILLS.length) {
            const s2 = SKILLS[i + 1];
            const l2 = getLevel(p, s2);
            const col2 = `${s2.padEnd(14)} ${String(l2).padStart(3)}`;
            out += `  ${col1}  |  ${col2}\n`;
          } else {
            out += `  ${col1}\n`;
          }
        }
        out += `\nTotal XP: ${totalXp.toLocaleString()}`;
        out += `\nQuest Points: ${(require('../data/quests')).getQuestPoints(p)}`;
        out += `\nBank Value: ~${bankValue.toLocaleString()} coins`;
        out += `\nTime Played: ${minutesPlayed} minutes (${ticksPlayed} ticks)`;
        return out;
      }

      // Standard examine
      const npc = npcs.findNpcByName(name, p.x, p.y, 15, p.layer);
      if (npc) return `${npc.name}: ${npc.examine} (Combat: ${npc.combat})`;
      const obj = objects.findObjectByName(name, p.x, p.y, 15, p.layer);
      if (obj) return `${obj.name}: ${obj.examine}`;
      return `Nothing called "${name}" nearby.`;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ACHIEVEMENT SYSTEM (feature 1)
  // ══════════════════════════════════════════════════════════════════════════
  const ACHIEVEMENTS = {
    first_blood: { name: 'First Blood', desc: 'Kill any NPC', goal: 1, type: 'kill_any', reward: { coins: 500 } },
    goblin_slayer: { name: 'Goblin Slayer', desc: 'Kill 100 goblins', goal: 100, type: 'kill', target: 'goblin', reward: { coins: 5000 } },
    lumberjack: { name: 'Lumberjack', desc: 'Chop 100 logs', goal: 100, type: 'skill_action', target: 'woodcutting', reward: { xp: { woodcutting: 5000 } } },
    master_chef: { name: 'Master Chef', desc: 'Cook 50 food', goal: 50, type: 'skill_action', target: 'cooking', reward: { xp: { cooking: 5000 } } },
    millionaire: { name: 'Millionaire', desc: 'Have 1,000,000 coins at once', goal: 1000000, type: 'coins', reward: { lamp: 'large' } },
    max_combat: { name: 'Max Combat', desc: 'Reach combat level 126', goal: 126, type: 'combat_level', reward: { lamp: 'large' } },
    total_500: { name: 'Total 500', desc: 'Reach total level 500', goal: 500, type: 'total_level', reward: { coins: 10000 } },
    total_1000: { name: 'Total 1000', desc: 'Reach total level 1000', goal: 1000, type: 'total_level', reward: { coins: 50000 } },
    total_1500: { name: 'Total 1500', desc: 'Reach total level 1500', goal: 1500, type: 'total_level', reward: { lamp: 'medium' } },
    total_2000: { name: 'Total 2000', desc: 'Reach total level 2000', goal: 2000, type: 'total_level', reward: { lamp: 'large' } },
    max_skill: { name: 'Skill Mastery', desc: 'Reach level 99 in any skill', goal: 99, type: 'any_99', reward: { lamp: 'large' } },
    all_quests: { name: 'Quest Cape', desc: 'Complete all quests', goal: 1, type: 'all_quests', reward: { coins: 100000 } },
    cow_killer: { name: 'Cow Killer', desc: 'Kill 50 cows', goal: 50, type: 'kill', target: 'cow', reward: { coins: 2000 } },
    chicken_chaser: { name: 'Chicken Chaser', desc: 'Kill 25 chickens', goal: 25, type: 'kill', target: 'chicken', reward: { coins: 1000 } },
    fisher_king: { name: 'Fisher King', desc: 'Catch 500 fish', goal: 500, type: 'skill_action', target: 'fishing', reward: { xp: { fishing: 10000 } } },
    miner_49er: { name: 'Miner 49er', desc: 'Mine 200 ores', goal: 200, type: 'skill_action', target: 'mining', reward: { xp: { mining: 10000 } } },
    wild_explorer: { name: 'Wild Explorer', desc: 'Reach Wilderness level 50', goal: 50, type: 'wildy_level', reward: { coins: 25000 } },
    first_death: { name: 'A Learning Experience', desc: 'Die for the first time', goal: 1, type: 'death', reward: { coins: 100 } },
    pickpocket_100: { name: 'Sticky Fingers', desc: 'Pick 100 pockets', goal: 100, type: 'skill_action', target: 'thieving', reward: { xp: { thieving: 5000 } } },
    hill_giant_hunter: { name: 'Giant Hunter', desc: 'Kill 50 hill giants', goal: 50, type: 'kill', target: 'hill giant', reward: { coins: 15000 } },
    demon_slayer: { name: 'Demon Slayer', desc: 'Kill 25 lesser demons', goal: 25, type: 'kill', target: 'lesser demon', reward: { coins: 25000 } },
    dragon_slayer_ach: { name: 'Dragon Slayer', desc: 'Kill 10 green dragons', goal: 10, type: 'kill', target: 'green dragon', reward: { coins: 50000 } },
    bone_collector: { name: 'Bone Collector', desc: 'Bury 200 bones', goal: 200, type: 'skill_action', target: 'prayer', reward: { xp: { prayer: 5000 } } },
    smith_100: { name: 'Hammer Time', desc: 'Smith 100 items', goal: 100, type: 'skill_action', target: 'smithing', reward: { xp: { smithing: 5000 } } },
    craft_master: { name: 'Craft Master', desc: 'Craft 100 items', goal: 100, type: 'skill_action', target: 'crafting', reward: { xp: { crafting: 5000 } } },
    fire_starter: { name: 'Fire Starter', desc: 'Light 50 fires', goal: 50, type: 'skill_action', target: 'firemaking', reward: { xp: { firemaking: 3000 } } },
    guard_robber: { name: 'Guard Robber', desc: 'Kill 25 guards', goal: 25, type: 'kill', target: 'guard', reward: { coins: 5000 } },
    slayer_10: { name: 'Slayer Apprentice', desc: 'Complete 10 slayer tasks', goal: 10, type: 'slayer_tasks', reward: { xp: { slayer: 5000 } } },
    skeleton_basher: { name: 'Skeleton Basher', desc: 'Kill 50 skeletons', goal: 50, type: 'kill', target: 'skeleton', reward: { coins: 5000 } },
    zombie_slayer: { name: 'Zombie Slayer', desc: 'Kill 50 zombies', goal: 50, type: 'kill', target: 'zombie', reward: { coins: 5000 } },
    agility_runner: { name: 'Agility Runner', desc: 'Complete 25 agility laps', goal: 25, type: 'skill_action', target: 'agility', reward: { xp: { agility: 5000 } } },
    herb_collector: { name: 'Herb Collector', desc: 'Clean 50 herbs', goal: 50, type: 'skill_action', target: 'herblore', reward: { xp: { herblore: 3000 } } },
  };

  function checkAchievement(p, achieveId, currentValue) {
    if (!p.achievementsComplete) p.achievementsComplete = {};
    if (!p.achievementProgress) p.achievementProgress = {};
    if (p.achievementsComplete[achieveId]) return null;
    const ach = ACHIEVEMENTS[achieveId];
    if (!ach) return null;
    p.achievementProgress[achieveId] = Math.max(p.achievementProgress[achieveId] || 0, currentValue);
    if (p.achievementProgress[achieveId] >= ach.goal) {
      p.achievementsComplete[achieveId] = true;
      // Award reward
      let rewardMsg = '';
      if (ach.reward.coins) {
        const { invAdd: ia, invCount: ic } = require('../player/player');
        invAdd(p, 101, 'Coins', ach.reward.coins, true);
        rewardMsg = `${ach.reward.coins} coins`;
      }
      if (ach.reward.xp) {
        for (const [skill, xp] of Object.entries(ach.reward.xp)) {
          addXp(p, skill, xp);
          rewardMsg += `${rewardMsg ? ' + ' : ''}${xp} ${skill} XP`;
        }
      }
      if (ach.reward.lamp) {
        const lampId = ach.reward.lamp === 'small' ? 950 : ach.reward.lamp === 'medium' ? 951 : 952;
        const lampName = `XP lamp (${ach.reward.lamp})`;
        invAdd(p, lampId, lampName, 1);
        rewardMsg += `${rewardMsg ? ' + ' : ''}${lampName}`;
      }
      return `Achievement unlocked: ${ach.name}! Reward: ${rewardMsg}`;
    }
    return null;
  }

  // Register event listeners for achievement tracking
  events.on('npc_kill', 'achievements_kill', (data) => {
    const { player: p, ws, npc, killCount } = data;
    // First Blood
    let msg = checkAchievement(p, 'first_blood', 1);
    if (msg) sendText(ws, msg);
    // Monster-specific kills
    const npcLower = npc.name.toLowerCase();
    for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
      if (ach.type === 'kill' && ach.target === npcLower) {
        msg = checkAchievement(p, id, killCount);
        if (msg) sendText(ws, msg);
      }
    }
    // Check slayer tasks achievement
    if (p.achievementProgress?._slayer_tasks) {
      msg = checkAchievement(p, 'slayer_10', p.achievementProgress._slayer_tasks);
      if (msg) sendText(ws, msg);
    }
    // Check combat level and total level achievements
    const cb = combatLevel(p);
    msg = checkAchievement(p, 'max_combat', cb);
    if (msg) sendText(ws, msg);
    const tl = totalLevel(p);
    for (const id of ['total_500', 'total_1000', 'total_1500', 'total_2000']) {
      msg = checkAchievement(p, id, tl);
      if (msg) sendText(ws, msg);
    }
    // Check 99 in any skill
    const { SKILLS } = require('../player/player');
    for (const s of SKILLS) {
      if (getLevel(p, s) >= 99) {
        msg = checkAchievement(p, 'max_skill', 99);
        if (msg) sendText(ws, msg);
        break;
      }
    }
    // Daily challenge kill tracking
    if (p.dailyChallenge && p.dailyChallenge.type === 'kill' && npcLower === p.dailyChallenge.targetName) {
      p.dailyChallenge.progress = (p.dailyChallenge.progress || 0) + 1;
      if (p.dailyChallenge.progress >= p.dailyChallenge.goal) {
        let dailyMsg = 'Daily Challenge complete!';
        if (p.dailyChallenge.rewardType === 'coins') {
          invAdd(p, 101, 'Coins', p.dailyChallenge.reward, true);
          dailyMsg += ` Reward: ${p.dailyChallenge.reward} coins.`;
        } else if (p.dailyChallenge.rewardType === 'xp' && p.dailyChallenge.rewardSkill) {
          addXp(p, p.dailyChallenge.rewardSkill, p.dailyChallenge.reward);
          dailyMsg += ` Reward: ${p.dailyChallenge.reward} ${p.dailyChallenge.rewardSkill} XP.`;
        }
        sendText(ws, dailyMsg);
        p.dailyChallenge.progress = p.dailyChallenge.goal; // Mark as done
      }
    }
    // Wilderness level achievement
    if (p.y <= 55) {
      const wildyLevel = 55 - p.y;
      msg = checkAchievement(p, 'wild_explorer', wildyLevel);
      if (msg) sendText(ws, msg);
    }
  });

  events.on('player_death', 'achievements_death', (data) => {
    const { player: p, ws } = data;
    const msg = checkAchievement(p, 'first_death', 1);
    if (msg) {
      // Need to find ws for player
      for (const [w, pl] of players) {
        if (pl === p) { sendText(w, msg); break; }
      }
    }
  });

  // Hook into skilling for achievement/daily tracking via a generic approach
  // We wrap addXp to emit skill events
  const origAddXp = addXp;
  // We track skilling actions via events instead of wrapping addXp
  // The recipe system calls addXp — we use the event system to intercept

  // Periodic achievement check for coins/total/combat level
  events.on('player_move', 'achievements_move', (data) => {
    const { player: p, ws } = data;
    if (!p || !ws) return;
    // Wilderness level
    if (p.y <= 55) {
      const wildyLevel = 55 - p.y;
      const msg = checkAchievement(p, 'wild_explorer', wildyLevel);
      if (msg) sendText(ws, msg);
    }
    // Coins check
    const coins = invCount(p, 101);
    if (coins >= 1000000) {
      const msg = checkAchievement(p, 'millionaire', coins);
      if (msg) sendText(ws, msg);
    }
  });

  commands.register('achievements', { help: 'View achievements', aliases: ['achieve', 'ach'], category: 'General',
    fn: (p) => {
      if (!p.achievementsComplete) p.achievementsComplete = {};
      if (!p.achievementProgress) p.achievementProgress = {};
      const completed = Object.keys(p.achievementsComplete).length;
      const total = Object.keys(ACHIEVEMENTS).length;
      let out = `── Achievements (${completed}/${total}) ──\n`;
      for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
        const done = p.achievementsComplete[id];
        const progress = p.achievementProgress[id] || 0;
        const icon = done ? '[DONE]' : `[${progress}/${ach.goal}]`;
        out += `  ${icon} ${ach.name} — ${ach.desc}\n`;
      }
      return out;
    }
  });

  commands.register('achievement', { help: 'View achievement details: achievement [name]', category: 'General',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) return 'Usage: achievement [name]. Type `achievements` to see all.';
      const entry = Object.entries(ACHIEVEMENTS).find(([id, a]) => a.name.toLowerCase().includes(name));
      if (!entry) return `Unknown achievement: "${name}". Type \`achievements\` to see all.`;
      const [id, ach] = entry;
      const done = p.achievementsComplete?.[id];
      const progress = p.achievementProgress?.[id] || 0;
      let out = `── ${ach.name} ──\n`;
      out += `${ach.desc}\n`;
      out += `Progress: ${progress}/${ach.goal} ${done ? '(COMPLETE!)' : ''}\n`;
      let rewardStr = '';
      if (ach.reward.coins) rewardStr += `${ach.reward.coins} coins`;
      if (ach.reward.xp) for (const [s, x] of Object.entries(ach.reward.xp)) rewardStr += `${rewardStr ? ' + ' : ''}${x} ${s} XP`;
      if (ach.reward.lamp) rewardStr += `${rewardStr ? ' + ' : ''}XP lamp (${ach.reward.lamp})`;
      out += `Reward: ${rewardStr}`;
      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // COLLECTION LOG (feature 2)
  // ══════════════════════════════════════════════════════════════════════════
  const CLOG_CATEGORIES = {
    monster_drops: 'Monster Drops',
    boss_drops: 'Boss Drops',
    clue_rewards: 'Clue Rewards',
    skilling: 'Skilling',
  };

  commands.register('clog', { help: 'Collection log: clog [category]', aliases: ['collectionlog'], category: 'General',
    fn: (p, args) => {
      if (!p.collectionLog) p.collectionLog = {};
      const cat = args.join(' ').toLowerCase().replace(/\s+/g, '_');
      if (cat && CLOG_CATEGORIES[cat]) {
        const entries = p.collectionLog[cat] || [];
        let out = `── Collection Log: ${CLOG_CATEGORIES[cat]} ──\n`;
        if (!entries.length) {
          out += '  (none obtained)\n';
        } else {
          for (const itemId of entries) {
            const def = items.get(itemId);
            out += `  ${def ? def.name : `Item #${itemId}`}\n`;
          }
        }
        out += `\nTotal: ${entries.length} unique items`;
        return out;
      }
      // Show all categories
      let out = '── Collection Log ──\n';
      let totalItems = 0;
      for (const [key, label] of Object.entries(CLOG_CATEGORIES)) {
        const count = (p.collectionLog[key] || []).length;
        totalItems += count;
        out += `  ${label}: ${count} unique items\n`;
      }
      out += `\nTotal: ${totalItems} unique items. Type \`clog [category]\` for details.`;
      out += `\nCategories: ${Object.keys(CLOG_CATEGORIES).join(', ')}`;
      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ACCOUNT MODES (feature 3)
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('mode', { help: 'Set account mode: mode [ironman/hcim/uim]', category: 'General',
    fn: (p, args) => {
      if (!args[0]) {
        const modeName = p.accountMode === 'ironman' ? 'Ironman' : p.accountMode === 'hcim' ? 'Hardcore Ironman' : p.accountMode === 'uim' ? 'Ultimate Ironman' : 'Normal';
        return `Account mode: ${modeName}.\nModes: ironman (no trading/GE), hcim (ironman + 1 life), uim (ironman + no bank)`;
      }
      if (p.modeSet) return 'Your account mode has already been set and cannot be changed.';
      const mode = args[0].toLowerCase();
      if (mode === 'ironman' || mode === 'im') {
        p.accountMode = 'ironman';
        p.modeSet = true;
        return 'Account set to Ironman. You cannot trade, use the GE, or pick up other players\' drops.';
      }
      if (mode === 'hcim' || mode === 'hardcore') {
        p.accountMode = 'hcim';
        p.modeSet = true;
        return 'Account set to Hardcore Ironman. Same as ironman, but your first death downgrades you to regular ironman.';
      }
      if (mode === 'uim' || mode === 'ultimate') {
        p.accountMode = 'uim';
        p.modeSet = true;
        return 'Account set to Ultimate Ironman. Same as ironman, plus you cannot use the bank.';
      }
      if (mode === 'normal' || mode === 'main') {
        p.accountMode = null;
        p.modeSet = true;
        return 'Account set to Normal mode.';
      }
      return 'Unknown mode. Options: ironman, hcim, uim, normal';
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // MAGIC COMBAT COMMAND (feature 5)
  // ══════════════════════════════════════════════════════════════════════════
  // Override the cast command to support combat spells
  // The existing cast command handles teleports. We extend it here.
  const existingCast = commands.commands.get('cast');
  if (existingCast) {
    const origFn = existingCast.fn;
    existingCast.fn = (p, args, raw) => {
      const fullArgs = args.join(' ').toLowerCase();
      // Check for "cast [spell] on [npc]" pattern
      const onMatch = fullArgs.match(/^(.+?)\s+on\s+(.+)$/);
      if (onMatch) {
        const spellName = onMatch[1].trim();
        const targetName = onMatch[2].trim();
        const { COMBAT_SPELLS, magicAttack, magicCombatXp } = require('../combat/combat');
        const spell = COMBAT_SPELLS[spellName];
        if (!spell) return origFn(p, args, raw);
        if (getLevel(p, 'magic') < spell.levelReq) return `You need Magic level ${spell.levelReq} to cast ${spellName}.`;
        // Check runes
        for (const rune of spell.runes) {
          if (invCount(p, rune.id) < rune.count) {
            const runeDef = items.get(rune.id);
            return `You need ${rune.count}x ${runeDef ? runeDef.name : 'rune'} to cast ${spellName}.`;
          }
        }
        // Find target NPC
        const npc = npcs.findNpcByName(targetName, p.x, p.y, 10, p.layer);
        if (!npc) return `No "${targetName}" nearby.`;
        if (npc.combat === 0) return `You can't attack the ${npc.name}.`;
        // Consume runes
        for (const rune of spell.runes) invRemove(p, rune.id, rune.count);
        updateWeight(p);
        // Perform magic attack
        const result = magicAttack(p, npc, spellName);
        if (!result) return `Failed to cast ${spellName}.`;
        npc.hp = Math.max(0, npc.hp - result.damage);
        const xpResult = magicCombatXp(p, result.damage, result.baseXp);
        let msg = result.hit
          ? `You cast ${spellName} on the ${npc.name} for ${result.damage} damage.${xpDrop('magic', result.damage * 2 + result.baseXp)}`
          : `You cast ${spellName} on the ${npc.name} but miss.${xpDrop('magic', result.baseXp)}`;
        if (xpResult.levelUp) msg += ` Magic level: ${xpResult.levelUp.level}!`;
        if (npc.hp <= 0) {
          npc.dead = true;
          npc.respawnAt = tick.getTick() + npc.respawnTicks;
          msg += ` The ${npc.name} is dead!`;
          // Kill count
          if (!p.killCounts) p.killCounts = {};
          const kcKey = npc.name.toLowerCase();
          p.killCounts[kcKey] = (p.killCounts[kcKey] || 0) + 1;
          // Find ws for player
          let playerWs = null;
          for (const [w, pl] of players) { if (pl === p) { playerWs = w; break; } }
          events.emit('npc_kill', { player: p, ws: playerWs, npc, killCount: p.killCounts[kcKey] });
          // Drops
          const droptables = require('../data/droptables');
          const drops = droptables.tables.has(npc.defId) ? droptables.roll(npc.defId) : npcs.rollDrops(npc);
          for (const drop of drops) {
            groundItems.push({ id: Date.now() + Math.floor(Math.random() * 10000), ...drop, x: npc.x, y: npc.y, layer: npc.layer, owner: p.id, despawnTick: tick.getTick() + 200 });
            msg += `\n  Loot: ${drop.name} x${drop.count}`;
          }
        } else {
          // NPC retaliates (set target)
          if (npc.combat > 0) npc.target = p.id;
        }
        return msg;
      }
      // Fall through to original cast handler (teleports etc.)
      return origFn(p, args, raw);
    };
    // Update help text
    existingCast.help = 'Cast a spell: cast [spell] or cast [spell] on [npc]';
  }

  // Show available combat spells
  commands.register('spells', { help: 'List combat spells', category: 'Magic',
    fn: (p) => {
      const { COMBAT_SPELLS } = require('../combat/combat');
      let out = '── Combat Spells ──\n';
      for (const [name, spell] of Object.entries(COMBAT_SPELLS)) {
        const canCast = getLevel(p, 'magic') >= spell.levelReq;
        const runes = spell.runes.map(r => `${r.count}x ${items.get(r.id)?.name || '?'}`).join(' + ');
        out += `  ${canCast ? '+' : '-'} ${name} (lvl ${spell.levelReq}, max ${spell.maxHit}) — ${runes}\n`;
      }
      out += '\nUsage: cast [spell] on [npc]';
      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // KILL COUNT TRACKING (feature 6)
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('kc', { help: 'Kill counts: kc [monster]', aliases: ['killcount'], category: 'Combat',
    fn: (p, args) => {
      if (!p.killCounts) p.killCounts = {};
      const name = args.join(' ').toLowerCase();
      if (name) {
        const count = p.killCounts[name];
        if (!count) return `You haven't killed any ${name}.`;
        return `Kill count — ${name}: ${count}`;
      }
      const entries = Object.entries(p.killCounts).sort((a, b) => b[1] - a[1]);
      if (!entries.length) return 'No kills recorded.';
      let out = '── Kill Counts ──\n';
      for (const [monster, count] of entries) {
        out += `  ${monster}: ${count}\n`;
      }
      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // DAILY CHALLENGES (feature 7)
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('daily', { help: 'Show current daily challenge', aliases: ['dailychallenge'], category: 'General',
    fn: (p) => {
      if (!p.dailyChallenge) return 'No daily challenge active. Relog to receive one.';
      const dc = p.dailyChallenge;
      const done = dc.progress >= dc.goal;
      const verb = dc.type === 'kill' ? 'Kill' : dc.type === 'cook' ? 'Cook' : dc.type === 'mine' ? 'Mine' : dc.type === 'chop' ? 'Chop' : dc.type === 'fish' ? 'Catch' : dc.type;
      const rewardStr = dc.rewardType === 'coins' ? `${dc.reward} coins` : `${dc.reward} ${dc.rewardSkill || ''} XP`;
      let out = `── Daily Challenge ──\n`;
      out += `${verb} ${dc.goal} ${dc.targetName}\n`;
      out += `Progress: ${dc.progress || 0}/${dc.goal} ${done ? '(COMPLETE!)' : ''}\n`;
      out += `Reward: ${rewardStr}\n`;
      const timeLeft = Math.max(0, 86400000 - (Date.now() - (dc.generatedAt || 0)));
      const hoursLeft = Math.floor(timeLeft / 3600000);
      const minsLeft = Math.floor((timeLeft % 3600000) / 60000);
      out += `Resets in: ${hoursLeft}h ${minsLeft}m`;
      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // LOOT TRACKER (feature 8)
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('loot', { help: 'Loot tracker: loot [monster]', aliases: ['loottracker'], category: 'Combat',
    fn: (p, args) => {
      if (!p.lootTracker) p.lootTracker = {};
      const name = args.join(' ').toLowerCase();
      if (name) {
        const drops = p.lootTracker[name];
        if (!drops || !drops.length) return `No loot recorded from ${name}.`;
        // Aggregate drops
        const agg = {};
        let totalValue = 0;
        for (const d of drops) {
          if (!agg[d.id]) agg[d.id] = { name: d.name, count: 0, value: 0 };
          agg[d.id].count += d.count;
          agg[d.id].value += d.value;
          totalValue += d.value;
        }
        let out = `── Loot from ${name} ──\n`;
        for (const [, item] of Object.entries(agg)) {
          out += `  ${item.name} x${item.count} (${item.value.toLocaleString()} gp)\n`;
        }
        out += `\nTotal value: ${totalValue.toLocaleString()} gp`;
        return out;
      }
      // Show session total
      const monsters = Object.keys(p.lootTracker);
      if (!monsters.length) return 'No loot received this session.';
      let out = `── Loot Tracker (Session) ──\n`;
      for (const monster of monsters) {
        const value = p.lootTracker[monster].reduce((s, d) => s + d.value, 0);
        const count = p.lootTracker[monster].length;
        out += `  ${monster}: ${count} drops (${value.toLocaleString()} gp)\n`;
      }
      out += `\nSession total: ${(p.lootTrackerTotal || 0).toLocaleString()} gp`;
      out += '\nResets on logout.';
      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // HISCORES IMPROVEMENT (feature 9)
  // ══════════════════════════════════════════════════════════════════════════
  // Override existing hiscores to load offline player files too
  const existingHiscores = commands.commands.get('hiscores');
  if (existingHiscores) {
    existingHiscores.fn = (p, args) => {
      const skill = args[0]?.toLowerCase() || 'total';
      const fs = require('fs');
      const path = require('path');
      const persistence = require('../engine/persistence');
      const playersDir = path.join(persistence.DATA_DIR, 'players');
      const allPlayers = [];
      // Include online players
      const onlineNames = new Set();
      for (const pl of playersByName.values()) {
        allPlayers.push({ name: pl.name, skills: pl.skills, online: true });
        onlineNames.add(pl.name.toLowerCase());
      }
      // Load offline player saves
      if (fs.existsSync(playersDir)) {
        const files = fs.readdirSync(playersDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const playerName = file.replace('.json', '');
          if (onlineNames.has(playerName)) continue; // Already included from online
          try {
            const data = JSON.parse(fs.readFileSync(path.join(playersDir, file), 'utf8'));
            if (data.skills) allPlayers.push({ name: data.name || playerName, skills: data.skills, online: false });
          } catch (e) { /* skip corrupt files */ }
        }
      }
      if (!allPlayers.length) return 'No hiscores data.';
      if (skill === 'total') {
        allPlayers.sort((a, b) => {
          const ta = Object.values(b.skills).reduce((s, sk) => s + (sk.level || 1), 0);
          const tb = Object.values(a.skills).reduce((s, sk) => s + (sk.level || 1), 0);
          return ta - tb;
        });
        let out = '── Hiscores (Total Level) ──\n';
        allPlayers.slice(0, 20).forEach((pl, i) => {
          const total = Object.values(pl.skills).reduce((s, sk) => s + (sk.level || 1), 0);
          out += `  ${i + 1}. ${pl.name}${pl.online ? ' *' : ''} — ${total}\n`;
        });
        out += '\n* = currently online';
        return out;
      }
      if (!allPlayers[0]?.skills[skill]) return `Unknown skill: ${skill}`;
      allPlayers.sort((a, b) => (b.skills[skill]?.xp || 0) - (a.skills[skill]?.xp || 0));
      let out = `── Hiscores (${skill}) ──\n`;
      allPlayers.slice(0, 20).forEach((pl, i) => {
        out += `  ${i + 1}. ${pl.name}${pl.online ? ' *' : ''} — Level ${pl.skills[skill]?.level || 1} (${(pl.skills[skill]?.xp || 0).toLocaleString()} XP)\n`;
      });
      out += '\n* = currently online';
      return out;
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRADE / GE IRONMAN RESTRICTIONS (feature 3)
  // ══════════════════════════════════════════════════════════════════════════
  const existingTrade = commands.commands.get('trade');
  if (existingTrade) {
    const origTradeFn = existingTrade.fn;
    existingTrade.fn = (p, args, raw) => {
      if (p.accountMode && ['ironman', 'hcim', 'uim'].includes(p.accountMode)) {
        return "As an ironman, you can't trade with other players.";
      }
      return origTradeFn(p, args, raw);
    };
  }

  const existingGiveTo = commands.commands.get('giveto');
  if (existingGiveTo) {
    const origGiveToFn = existingGiveTo.fn;
    existingGiveTo.fn = (p, args, raw) => {
      if (p.accountMode && ['ironman', 'hcim', 'uim'].includes(p.accountMode)) {
        return "As an ironman, you can't give items to other players.";
      }
      return origGiveToFn(p, args, raw);
    };
  }

  const existingGE = commands.commands.get('ge');
  if (existingGE) {
    const origGEFn = existingGE.fn;
    existingGE.fn = (p, args, raw) => {
      if (p.accountMode && ['ironman', 'hcim', 'uim'].includes(p.accountMode)) {
        const sub = args[0]?.toLowerCase();
        if (sub === 'buy' || sub === 'sell') return "As an ironman, you can't use the Grand Exchange.";
      }
      return origGEFn(p, args, raw);
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EXAMINE SELF — add mode icon (feature 3)
  // ══════════════════════════════════════════════════════════════════════════
  const existingExamine = commands.commands.get('examine');
  if (existingExamine) {
    const origExamineFn = existingExamine.fn;
    existingExamine.fn = (p, args, raw) => {
      const result = origExamineFn(p, args, raw);
      const name = args.join(' ').toLowerCase();
      if (name === 'self' || name === 'me' || name === 'myself') {
        const modeStr = p.accountMode === 'ironman' ? '\nAccount Mode: Ironman' : p.accountMode === 'hcim' ? '\nAccount Mode: Hardcore Ironman' : p.accountMode === 'uim' ? '\nAccount Mode: Ultimate Ironman' : '';
        // Insert mode after first line
        if (modeStr) return result.replace(/\n/, modeStr + '\n');
      }
      return result;
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SKILLING EVENT HOOKS for achievements & dailies
  // ══════════════════════════════════════════════════════════════════════════
  // We emit skilling events by hooking into the recipe action completion.
  // Since the recipe system is generic, we tap into the existing startRecipeAction.
  // We do this by wrapping the addXp function in ctx to emit events.

  // ── Skill action tracking for achievements and dailies ──
  // Called from recipe/gathering completions
  function trackSkillingAction(p, skill) {
    if (!p.achievementProgress) p.achievementProgress = {};
    const key = `_action_${skill}`;
    p.achievementProgress[key] = (p.achievementProgress[key] || 0) + 1;
    const count = p.achievementProgress[key];

    // Check skill-specific achievements
    for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
      if (ach.type === 'skill_action' && ach.target === skill) {
        const msg = checkAchievement(p, id, count);
        if (msg) {
          for (const [w, pl] of players) { if (pl === p) { sendText(w, msg); break; } }
        }
      }
    }

    // Daily challenge tracking for skilling
    if (p.dailyChallenge && p.dailyChallenge.progress < p.dailyChallenge.goal) {
      const dc = p.dailyChallenge;
      const typeMap = { cooking: 'cook', mining: 'mine', woodcutting: 'chop', fishing: 'fish' };
      if (typeMap[skill] === dc.type) {
        dc.progress = (dc.progress || 0) + 1;
        if (dc.progress >= dc.goal) {
          for (const [w, pl] of players) {
            if (pl === p) {
              let dailyMsg = 'Daily Challenge complete!';
              if (dc.rewardType === 'coins') {
                invAdd(p, 101, 'Coins', dc.reward, true);
                dailyMsg += ` Reward: ${dc.reward} coins.`;
              } else if (dc.rewardType === 'xp' && dc.rewardSkill) {
                addXp(p, dc.rewardSkill, dc.reward);
                dailyMsg += ` Reward: ${dc.reward} ${dc.rewardSkill} XP.`;
              }
              sendText(w, dailyMsg);
              break;
            }
          }
        }
      }
    }

    // Check total/combat level achievements
    const tl = totalLevel(p);
    const cb = combatLevel(p);
    for (const [w, pl] of players) {
      if (pl === p) {
        for (const id of ['total_500', 'total_1000', 'total_1500', 'total_2000']) {
          const msg = checkAchievement(p, id, tl);
          if (msg) sendText(w, msg);
        }
        const cbMsg = checkAchievement(p, 'max_combat', cb);
        if (cbMsg) sendText(w, cbMsg);
        const { SKILLS } = require('../player/player');
        for (const s of SKILLS) {
          if (getLevel(p, s) >= 99) {
            const msg99 = checkAchievement(p, 'max_skill', 99);
            if (msg99) sendText(w, msg99);
            break;
          }
        }
        break;
      }
    }
  }

  // Make trackSkillingAction available to the event system
  events.on('skill_action', 'skill_tracking', (data) => {
    trackSkillingAction(data.player, data.skill);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // XP LAMP USAGE
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('uselamp', { help: 'Use XP lamp: uselamp [skill]', category: 'Items',
    fn: (p, args) => {
      const skill = (args[0] || '').toLowerCase();
      const { SKILLS, getLevelUpMessage } = require('../player/player');
      if (!SKILLS.includes(skill)) return `Usage: uselamp [skill]. Skills: ${SKILLS.join(', ')}`;
      // Find lamp in inventory (check large, medium, small, generic)
      const lampIds = [952, 951, 950, 953];
      const lampMultipliers = { 950: 1, 951: 3, 952: 10, 953: 1 };
      const lampNames = { 950: 'small', 951: 'medium', 952: 'large', 953: 'experience' };
      for (const lid of lampIds) {
        const slot = p.inventory.findIndex(s => s && s.id === lid);
        if (slot >= 0) {
          const level = getLevel(p, skill);
          const xp = level * 100 * (lampMultipliers[lid] || 1);
          p.inventory[slot] = p.inventory[slot].count > 1 ? { ...p.inventory[slot], count: p.inventory[slot].count - 1 } : null;
          const lvl = addXp(p, skill, xp);
          let msg = `You rub the XP lamp (${lampNames[lid]}). +${xp.toLocaleString()} ${skill} XP!`;
          if (lvl) {
            msg += ` ${skill.charAt(0).toUpperCase() + skill.slice(1)} level: ${lvl}!`;
            const unlock = getLevelUpMessage ? getLevelUpMessage(skill, lvl) : null;
            if (unlock) msg += ` ${unlock}`;
          }
          return msg;
        }
      }
      return "You don't have any XP lamps.";
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. PLAYER-OWNED HOUSE (Construction)
  // ══════════════════════════════════════════════════════════════════════════
  const HOUSE_ROOMS = {
    parlour: { name: 'Parlour', level: 1, planks: 3, nails: 5, furniture: {
      chair: { name: 'Chair', level: 1, planks: 2, nails: 2, xp: 58 },
      bookcase: { name: 'Bookcase', level: 4, planks: 4, nails: 4, xp: 115 },
      fireplace: { name: 'Fireplace', level: 3, planks: 3, nails: 3, xp: 80 },
    }},
    kitchen: { name: 'Kitchen', level: 5, planks: 5, nails: 5, furniture: {
      table: { name: 'Table', level: 5, planks: 4, nails: 4, xp: 87 },
      stove: { name: 'Stove', level: 7, planks: 5, nails: 5, xp: 120 },
      sink: { name: 'Sink', level: 6, planks: 3, nails: 3, xp: 90 },
    }},
    bedroom: { name: 'Bedroom', level: 10, planks: 6, nails: 6, furniture: {
      bed: { name: 'Bed', level: 10, planks: 5, nails: 4, xp: 117 },
      wardrobe: { name: 'Wardrobe', level: 12, planks: 6, nails: 5, xp: 150 },
      dresser: { name: 'Dresser', level: 11, planks: 4, nails: 3, xp: 121 },
    }},
    chapel: { name: 'Chapel', level: 20, planks: 8, nails: 8, furniture: {
      pew: { name: 'Pew', level: 20, planks: 5, nails: 4, xp: 200 },
      small_altar: { name: 'Small Altar', level: 25, planks: 8, nails: 6, xp: 350 },
    }},
    workshop: { name: 'Workshop', level: 15, planks: 7, nails: 7, furniture: {
      workbench: { name: 'Workbench', level: 15, planks: 5, nails: 5, xp: 143 },
      repair_stand: { name: 'Repair Stand', level: 18, planks: 6, nails: 6, xp: 180 },
      tool_rack: { name: 'Tool Rack', level: 16, planks: 4, nails: 4, xp: 120 },
    }},
  };

  commands.register('house', { help: 'House commands: house, house build [room], house furniture [item], house rooms, house leave', category: 'Construction',
    fn: (p, args) => {
      if (!p.house) p.house = [];
      const sub = (args[0] || '').toLowerCase();

      if (!sub || sub === 'enter') {
        // Teleport to house
        if (p.house.length === 0) return 'You don\'t have a house yet. Build a room first with `house build [room]`.';
        p.houseLocation = { x: p.x, y: p.y, layer: p.layer };
        p.x = 1000; p.y = 1000; p.layer = 99; p.path = [];
        return `You teleport to your house.\nRooms: ${p.house.map(r => r.type).join(', ')}\nType \`house rooms\` for details, \`house leave\` to exit.`;
      }

      if (sub === 'build') {
        const roomType = args.slice(1).join(' ').toLowerCase();
        const roomDef = HOUSE_ROOMS[roomType];
        if (!roomDef) return `Unknown room type. Available: ${Object.keys(HOUSE_ROOMS).join(', ')}`;
        if (getLevel(p, 'construction') < roomDef.level) return `You need Construction level ${roomDef.level} to build a ${roomDef.name}.`;
        if (invCount(p, 700) < roomDef.planks) return `You need ${roomDef.planks} planks.`;
        if (invCount(p, 704) < roomDef.nails) return `You need ${roomDef.nails} nails.`;
        if (p.house.some(r => r.type === roomType)) return `You already have a ${roomDef.name}.`;
        invRemove(p, 700, roomDef.planks);
        invRemove(p, 704, roomDef.nails);
        updateWeight(p);
        const buildXp = roomDef.planks * 30;
        const lvl = addXp(p, 'construction', buildXp);
        p.house.push({ type: roomType, furniture: {} });
        let msg = `You build a ${roomDef.name}!${xpDrop('construction', buildXp)}`;
        if (lvl) msg += levelUpMsg('construction', lvl);
        return msg;
      }

      if (sub === 'furniture') {
        const furnitureName = args.slice(1).join(' ').toLowerCase();
        if (!furnitureName) {
          // List available furniture for current room
          if (p.layer !== 99) return 'You must be in your house. Type `house` to enter.';
          let out = '── Available Furniture ──\n';
          for (const room of p.house) {
            const roomDef = HOUSE_ROOMS[room.type];
            if (!roomDef) continue;
            out += `\n${roomDef.name}:\n`;
            for (const [fId, fDef] of Object.entries(roomDef.furniture)) {
              const built = room.furniture[fId] ? ' [BUILT]' : '';
              out += `  ${fDef.name} (lvl ${fDef.level}, ${fDef.planks} planks, ${fDef.nails} nails, ${fDef.xp} XP)${built}\n`;
            }
          }
          return out;
        }
        if (p.layer !== 99) return 'You must be in your house. Type `house` to enter.';
        // Find which room has this furniture
        for (const room of p.house) {
          const roomDef = HOUSE_ROOMS[room.type];
          if (!roomDef) continue;
          for (const [fId, fDef] of Object.entries(roomDef.furniture)) {
            if (fDef.name.toLowerCase() === furnitureName || fId === furnitureName) {
              if (room.furniture[fId]) return `${fDef.name} is already built.`;
              if (getLevel(p, 'construction') < fDef.level) return `You need Construction level ${fDef.level}.`;
              if (invCount(p, 700) < fDef.planks) return `You need ${fDef.planks} planks.`;
              if (invCount(p, 704) < fDef.nails) return `You need ${fDef.nails} nails.`;
              invRemove(p, 700, fDef.planks);
              invRemove(p, 704, fDef.nails);
              updateWeight(p);
              room.furniture[fId] = true;
              const lvl = addXp(p, 'construction', fDef.xp);
              let msg = `You build a ${fDef.name} in the ${roomDef.name}.${xpDrop('construction', fDef.xp)}`;
              if (lvl) msg += levelUpMsg('construction', lvl);
              events.emit('skill_action', { player: p, skill: 'construction' });
              return msg;
            }
          }
        }
        return `Unknown furniture: "${furnitureName}". Type \`house furniture\` to see options.`;
      }

      if (sub === 'rooms') {
        if (p.house.length === 0) return 'No rooms built. Use `house build [room]`.';
        let out = '── Your House ──\n';
        for (const room of p.house) {
          const roomDef = HOUSE_ROOMS[room.type];
          if (!roomDef) continue;
          const furnitureList = Object.entries(roomDef.furniture).map(([fId, fDef]) => {
            return `${fDef.name}: ${room.furniture[fId] ? 'Built' : 'Empty'}`;
          }).join(', ');
          out += `  ${roomDef.name}: ${furnitureList}\n`;
        }
        return out;
      }

      if (sub === 'leave') {
        if (p.layer !== 99) return 'You are not in your house.';
        const loc = p.houseLocation || { x: 100, y: 100, layer: 0 };
        p.x = loc.x; p.y = loc.y; p.layer = loc.layer; p.path = [];
        p.houseLocation = null;
        return 'You leave your house.';
      }

      return 'Usage: house, house build [room], house furniture [item], house rooms, house leave';
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. BOSS ENCOUNTERS
  // ══════════════════════════════════════════════════════════════════════════
  const BOSS_INFO = {
    'king black dragon': { defId: 'king_black_dragon', name: 'King Black Dragon', combat: 276, hp: 255, desc: '3 phases (170/85 HP). Dragonfire every 5 ticks (10 dmg, anti-dragon shield reduces to 1). Location: KBD Lair (NE wilderness).' },
    'giant mole': { defId: 'giant_mole', name: 'Giant Mole', combat: 230, hp: 200, desc: 'Digs underground at 50% HP and teleports. Re-emerges after 5 ticks. Location: Mole Den (SW).' },
    'barrows': { defId: 'barrows', name: 'Barrows Brothers', combat: 115, hp: '100 each', desc: '6 brothers fought sequentially. Dharok: hits harder at low HP. Verac: hits through prayer. Guthan: heals on hit. Location: Barrows (E).' },
  };

  commands.register('boss', { help: 'Boss info: boss [name]', category: 'Combat',
    fn: (p, args) => {
      const name = args.join(' ').toLowerCase();
      if (!name) {
        let out = '── Bosses ──\n';
        for (const [, info] of Object.entries(BOSS_INFO)) {
          const kc = p.bossKills?.[info.defId] || 0;
          out += `  ${info.name} (Combat ${info.combat}, ${info.hp} HP) — KC: ${kc}\n`;
        }
        out += '\nType `boss [name]` for details.';
        return out;
      }
      const info = BOSS_INFO[name];
      if (!info) return `Unknown boss. Available: ${Object.values(BOSS_INFO).map(b => b.name).join(', ')}`;
      const kc = p.bossKills?.[info.defId] || 0;
      return `── ${info.name} ──\nCombat: ${info.combat} | HP: ${info.hp}\n${info.desc}\nYour KC: ${kc}`;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. TREASURE TRAILS (Clue Scrolls)
  // ══════════════════════════════════════════════════════════════════════════
  const CLUE_STEPS = {
    beginner: [
      { type: 'coordinate', x: 82, y: 98, hint: 'Dig at (82, 98) — somewhere near the cows.' },
      { type: 'riddle', area: 'dock', hint: 'I am found where nets meet the sea.' },
      { type: 'emote', emote: 'dance', area: 'mines', hint: 'Perform the dance emote at the mining site.' },
      { type: 'coordinate', x: 75, y: 64, hint: 'Dig at (75, 64) — green creatures lurk here.' },
      { type: 'riddle', area: 'town', hint: 'I am found where merchants gather.' },
    ],
    medium: [
      { type: 'coordinate', x: 130, y: 45, hint: 'Dig at (130, 45) — deep in dangerous territory.' },
      { type: 'riddle', area: 'forest', hint: 'I am found among ancient trees.' },
      { type: 'emote', emote: 'bow', area: 'giant_plains', hint: 'Bow before the giants.' },
      { type: 'coordinate', x: 128, y: 113, hint: 'Dig at (128, 113) — precious metals gleam.' },
      { type: 'riddle', area: 'goblin_village', hint: 'I am found in a settlement of small green folk.' },
      { type: 'emote', emote: 'clap', area: 'fields', hint: 'Clap at the farmlands.' },
      { type: 'coordinate', x: 110, y: 97, hint: 'Dig at (110, 97) — near the air altar.' },
    ],
  };

  const CLUE_REWARDS = {
    beginner: [
      { id: 101, name: 'Coins', min: 500, max: 5000, stackable: true },
      { id: 270, name: 'Air rune', min: 20, max: 50, stackable: true },
      { id: 915, name: 'Elegant shirt', min: 1, max: 1 },
      { id: 916, name: 'Elegant legs', min: 1, max: 1 },
    ],
    medium: [
      { id: 101, name: 'Coins', min: 5000, max: 50000, stackable: true },
      { id: 277, name: 'Death rune', min: 20, max: 100, stackable: true },
      { id: 910, name: 'Ranger boots', min: 1, max: 1 },
      { id: 911, name: 'Wizard boots', min: 1, max: 1 },
      { id: 912, name: 'Holy sandals', min: 1, max: 1 },
      { id: 913, name: 'Trimmed armour set', min: 1, max: 1 },
      { id: 914, name: 'Gold-trimmed armour set', min: 1, max: 1 },
    ],
  };

  function startClue(p, tier) {
    const steps = CLUE_STEPS[tier];
    if (!steps) return;
    const numSteps = tier === 'beginner' ? 3 : 5;
    // Pick random steps
    const shuffled = [...steps].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numSteps);
    p.activeClue = { tier, steps: selected, currentStep: 0 };
  }

  commands.register('clue', { help: 'Show current clue scroll step', category: 'Items',
    fn: (p) => {
      if (!p.activeClue) {
        // Check if player has a clue scroll in inventory
        const beginnerSlot = p.inventory.findIndex(s => s && s.id === 900);
        const mediumSlot = p.inventory.findIndex(s => s && s.id === 902);
        if (beginnerSlot >= 0) {
          p.inventory[beginnerSlot] = p.inventory[beginnerSlot].count > 1 ? { ...p.inventory[beginnerSlot], count: p.inventory[beginnerSlot].count - 1 } : null;
          startClue(p, 'beginner');
          return `You open the beginner clue scroll.\nStep 1/${p.activeClue.steps.length}: ${p.activeClue.steps[0].hint}`;
        }
        if (mediumSlot >= 0) {
          p.inventory[mediumSlot] = p.inventory[mediumSlot].count > 1 ? { ...p.inventory[mediumSlot], count: p.inventory[mediumSlot].count - 1 } : null;
          startClue(p, 'medium');
          return `You open the medium clue scroll.\nStep 1/${p.activeClue.steps.length}: ${p.activeClue.steps[0].hint}`;
        }
        return 'You have no active clue scroll. Get one from monster drops.';
      }
      const step = p.activeClue.steps[p.activeClue.currentStep];
      return `── Clue Scroll (${p.activeClue.tier}) ──\nStep ${p.activeClue.currentStep + 1}/${p.activeClue.steps.length}: ${step.hint}`;
    }
  });

  function advanceClue(p) {
    if (!p.activeClue) return null;
    p.activeClue.currentStep++;
    if (p.activeClue.currentStep >= p.activeClue.steps.length) {
      // Complete! Roll rewards
      const tier = p.activeClue.tier;
      const rewardPool = CLUE_REWARDS[tier];
      const numRewards = 1 + Math.floor(Math.random() * 3);
      const rewards = [];
      for (let i = 0; i < numRewards; i++) {
        const r = rewardPool[Math.floor(Math.random() * rewardPool.length)];
        const count = r.min + Math.floor(Math.random() * (r.max - r.min + 1));
        invAdd(p, r.id, r.name, count, r.stackable);
        rewards.push(`${r.name} x${count}`);
      }
      p.activeClue = null;
      return `Clue scroll complete! Rewards:\n  ${rewards.join('\n  ')}`;
    }
    const nextStep = p.activeClue.steps[p.activeClue.currentStep];
    return `Step complete! Next step ${p.activeClue.currentStep + 1}/${p.activeClue.steps.length}: ${nextStep.hint}`;
  }

  commands.register('dig', { help: 'Dig at your current location (for clue scrolls)', category: 'Items',
    fn: (p) => {
      if (!p.activeClue) return 'You dig but find nothing interesting.';
      const step = p.activeClue.steps[p.activeClue.currentStep];
      if (step.type !== 'coordinate') return 'You dig but find nothing interesting.';
      if (Math.abs(p.x - step.x) > 1 || Math.abs(p.y - step.y) > 1) return 'You dig but find nothing interesting.';
      return advanceClue(p);
    }
  });

  // Hook emote for clue checking
  const existingEmote = commands.commands.get('emote');
  if (existingEmote) {
    const origEmoteFn = existingEmote.fn;
    existingEmote.fn = (p, args, raw) => {
      const result = origEmoteFn(p, args, raw);
      // Check clue step
      if (p.activeClue) {
        const step = p.activeClue.steps[p.activeClue.currentStep];
        if (step.type === 'emote') {
          const emoteName = args.join(' ').toLowerCase();
          const area = tiles.getArea(p.x, p.y, p.layer);
          if (emoteName === step.emote && area && area.id === step.area) {
            const clueResult = advanceClue(p);
            if (clueResult) {
              for (const [w, pl] of players) { if (pl === p) { sendText(w, clueResult); break; } }
            }
          }
        }
      }
      return result;
    };
  }

  // Hook movement for riddle clue checking
  events.on('player_move', 'clue_riddle_check', (data) => {
    const { player: p, ws } = data;
    if (!p || !ws || !p.activeClue) return;
    const step = p.activeClue.steps[p.activeClue.currentStep];
    if (step.type !== 'riddle') return;
    const area = tiles.getArea(p.x, p.y, p.layer);
    if (area && area.id === step.area) {
      const result = advanceClue(p);
      if (result) sendText(ws, result);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. DUEL ARENA
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('duel', { help: 'Duel a player: duel [player], duel accept, duel rules [rule], duel stats', category: 'Combat',
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      if (sub === 'stats') {
        return `── Duel Stats ──\nWins: ${p.duelWins || 0}\nLosses: ${p.duelLosses || 0}\nWin rate: ${(p.duelWins || 0) + (p.duelLosses || 0) > 0 ? ((p.duelWins / ((p.duelWins || 0) + (p.duelLosses || 0))) * 100).toFixed(1) + '%' : 'N/A'}`;
      }

      if (sub === 'accept') {
        if (!p.duelChallenge) return 'No pending duel challenge.';
        const challenger = findPlayer(p.duelChallenge.from);
        if (!challenger) { p.duelChallenge = null; return 'Challenger is no longer online.'; }
        // Start duel
        p.inDuel = true;
        challenger.inDuel = true;
        p.duelChallenge = null;
        challenger.duelChallenge = null;
        // Save locations and teleport to arena
        p._preDuelLoc = { x: p.x, y: p.y, layer: p.layer };
        challenger._preDuelLoc = { x: challenger.x, y: challenger.y, layer: challenger.layer };
        p.x = 117; p.y = 75; p.layer = 0; p.path = [];
        challenger.x = 118; challenger.y = 75; challenger.layer = 0; challenger.path = [];
        // Set PvP targets
        p.pvpTarget = challenger.id; p.busy = true;
        challenger.pvpTarget = p.id; challenger.busy = true;
        for (const [w, pl] of players) {
          if (pl === challenger) sendText(w, `Duel started against ${p.name}! Fight!`);
        }
        return `Duel started against ${challenger.name}! Fight!`;
      }

      if (sub === 'rules') {
        const rule = args.slice(1).join(' ').toLowerCase();
        if (!rule) {
          if (!p.duelChallenge) return 'No pending duel. Challenge someone first.';
          const rules = p.duelChallenge.rules || {};
          return `── Duel Rules ──\nNo food: ${rules.noFood ? 'ON' : 'OFF'}\nNo prayer: ${rules.noPrayer ? 'ON' : 'OFF'}\nNo special: ${rules.noSpecial ? 'ON' : 'OFF'}`;
        }
        if (!p.duelChallenge) return 'No pending duel.';
        if (!p.duelChallenge.rules) p.duelChallenge.rules = {};
        if (rule === 'no food') { p.duelChallenge.rules.noFood = !p.duelChallenge.rules.noFood; return `No food: ${p.duelChallenge.rules.noFood ? 'ON' : 'OFF'}`; }
        if (rule === 'no prayer') { p.duelChallenge.rules.noPrayer = !p.duelChallenge.rules.noPrayer; return `No prayer: ${p.duelChallenge.rules.noPrayer ? 'ON' : 'OFF'}`; }
        if (rule === 'no special') { p.duelChallenge.rules.noSpecial = !p.duelChallenge.rules.noSpecial; return `No special: ${p.duelChallenge.rules.noSpecial ? 'ON' : 'OFF'}`; }
        return 'Rules: no food, no prayer, no special';
      }

      // Challenge a player
      const targetName = args.join(' ');
      if (!targetName) return 'Usage: duel [player], duel accept, duel rules [rule], duel stats';
      const target = findPlayer(targetName);
      if (!target) return `Player "${targetName}" not found.`;
      if (target === p) return "You can't duel yourself.";
      target.duelChallenge = { from: p.name, rules: {} };
      for (const [w, pl] of players) {
        if (pl === target) sendText(w, `${p.name} challenges you to a duel! Type \`duel accept\` or \`duel rules\`.`);
      }
      return `Duel challenge sent to ${target.name}. Waiting for acceptance...`;
    }
  });

  // Hook into PvP death for duel completion
  events.on('player_death', 'duel_death', (data) => {
    const { player: p, ws } = data;
    if (!p.inDuel) return;
    p.inDuel = false;
    // Find the opponent (the one who was dueling this player)
    for (const [w, pl] of players) {
      if (pl.inDuel && pl.pvpTarget === p.id) {
        pl.inDuel = false;
        pl.pvpTarget = null;
        pl.busy = false;
        pl.duelWins = (pl.duelWins || 0) + 1;
        p.duelLosses = (p.duelLosses || 0) + 1;
        sendText(w, `You have won the duel against ${p.name}! Wins: ${pl.duelWins}, Losses: ${pl.duelLosses}`);
        // Return winner to pre-duel location
        if (pl._preDuelLoc) {
          pl.x = pl._preDuelLoc.x; pl.y = pl._preDuelLoc.y; pl.layer = pl._preDuelLoc.layer;
          delete pl._preDuelLoc;
        }
        break;
      }
    }
    // Duel is safe — restore loser's items (they keep everything)
    // Return loser to pre-duel location
    if (p._preDuelLoc) {
      p.x = p._preDuelLoc.x; p.y = p._preDuelLoc.y; p.layer = p._preDuelLoc.layer;
      delete p._preDuelLoc;
    }
    p.hp = p.maxHp; // Full heal after duel
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. MUSIC SYSTEM
  // ══════════════════════════════════════════════════════════════════════════
  const ALL_TRACKS = [
    'Newbie Melody', 'Harmony', 'Autumn Voyage', 'Flute Salad', 'Country Jig',
    'Dwarven Domain', 'Sea Shanty 2', 'Goblin Game', 'Scape Main', 'Wilderness',
    'Dark Wilderness', 'Dragon Slayer', 'Subterranea', 'Barrows', 'Duel Arena',
    'Rune Essence', 'Waterfall', 'Crystal Cave', 'Volcanic',
  ];

  commands.register('music', { help: 'Music: music, music list, music play [track]', category: 'General',
    fn: (p, args) => {
      if (!p.unlockedTracks) p.unlockedTracks = [];
      const sub = (args[0] || '').toLowerCase();

      if (!sub) {
        return `Now playing: ${p.currentTrack || 'Nothing'}\nTracks unlocked: ${p.unlockedTracks.length}/${ALL_TRACKS.length}`;
      }

      if (sub === 'list') {
        let out = `── Music Tracks (${p.unlockedTracks.length}/${ALL_TRACKS.length}) ──\n`;
        for (const track of ALL_TRACKS) {
          const unlocked = p.unlockedTracks.includes(track);
          const playing = p.currentTrack === track;
          out += `  ${unlocked ? '[+]' : '[-]'} ${unlocked ? track : '???'}${playing ? ' (now playing)' : ''}\n`;
        }
        if (p.unlockedTracks.length >= ALL_TRACKS.length) out += '\nAll tracks unlocked! Music cape achieved!';
        return out;
      }

      if (sub === 'play') {
        const trackName = args.slice(1).join(' ');
        const track = p.unlockedTracks.find(t => t.toLowerCase() === trackName.toLowerCase());
        if (!track) return `Track not unlocked or unknown: "${trackName}". Type \`music list\` to see unlocked tracks.`;
        p.currentTrack = track;
        return `Now playing: ${track}`;
      }

      return 'Usage: music, music list, music play [track]';
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. SLAYER REWARD SHOP
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('slayershop', { help: 'Slayer reward shop: slayershop, slayer buy [reward]', aliases: ['slayer shop'], category: 'Combat',
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();
      if (sub === 'buy') {
        const rewardName = args.slice(1).join(' ').toLowerCase().replace(/\s+/g, '_');
        // Also try without underscores
        let rewardId = rewardName;
        if (!slayer.SLAYER_REWARDS[rewardId]) {
          rewardId = Object.keys(slayer.SLAYER_REWARDS).find(k => slayer.SLAYER_REWARDS[k].name.toLowerCase() === args.slice(1).join(' ').toLowerCase());
        }
        if (!rewardId) return `Unknown reward. Type \`slayershop\` to see available rewards.`;

        if (rewardId === 'block_slot') {
          const monsterName = args.slice(3).join(' ').toLowerCase();
          if (!monsterName) return 'Usage: slayershop buy block slot [monster name]';
          if (!p.slayerBlocked) p.slayerBlocked = [];
          if (p.slayerBlocked.includes(monsterName)) return `${monsterName} is already blocked.`;
          if (!p.slayerPoints || p.slayerPoints < 100) return `You need 100 points. You have ${p.slayerPoints || 0}.`;
          p.slayerPoints -= 100;
          p.slayerBlocked.push(monsterName);
          return `Blocked ${monsterName}. Points: ${p.slayerPoints}. Blocked list: ${p.slayerBlocked.join(', ')}`;
        }

        const result = slayer.buyReward(p, rewardId);
        if (result.error) return result.error;
        return result.msg;
      }

      // Show shop
      let out = `── Slayer Reward Shop ──\nYour points: ${p.slayerPoints || 0}\n`;
      for (const [id, reward] of Object.entries(slayer.SLAYER_REWARDS)) {
        out += `  ${reward.name} — ${reward.cost} pts — ${reward.desc}\n`;
      }
      out += '\nType `slayershop buy [reward name]` to purchase.';
      return out;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. BOUNTY HUNTER
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('target', { help: 'Show your Bounty Hunter target', category: 'Combat',
    fn: (p) => {
      if (p.y > 55) return 'You must be in the Wilderness for Bounty Hunter.';
      // Find a target among wilderness players
      if (!p.bhTarget) {
        const wildyPlayers = [];
        for (const [, pl] of players) {
          if (pl !== p && pl.y <= 55 && pl.connected && !pl.bhTarget) {
            const pCombat = combatLevel(p);
            const tCombat = combatLevel(pl);
            const wildyLevel = Math.max(55 - p.y, 55 - pl.y);
            if (Math.abs(pCombat - tCombat) <= wildyLevel) wildyPlayers.push(pl);
          }
        }
        if (!wildyPlayers.length) return 'No suitable targets found in the Wilderness.';
        const target = wildyPlayers[Math.floor(Math.random() * wildyPlayers.length)];
        p.bhTarget = target.id;
        target.bhTarget = p.id;
        for (const [w, pl] of players) {
          if (pl === target) sendText(w, `You have been assigned as ${p.name}'s Bounty Hunter target!`);
        }
        return `Bounty Hunter target: ${target.name} (Combat ${combatLevel(target)})`;
      }
      // Show existing target
      for (const [, pl] of players) {
        if (pl.id === p.bhTarget) {
          return `BH Target: ${pl.name} (Combat ${combatLevel(pl)}) at approximately (${pl.x}, ${pl.y})`;
        }
      }
      p.bhTarget = null;
      return 'Your target is no longer available. Type `target` to get a new one.';
    }
  });

  commands.register('bounty', { help: 'Show Bounty Hunter stats', category: 'Combat',
    fn: (p) => {
      return `── Bounty Hunter ──\nKills: ${p.bhKills || 0}\nDeaths: ${p.bhDeaths || 0}\nCurrent target: ${p.bhTarget ? 'Active' : 'None'}`;
    }
  });

  // Hook PvP kills for BH
  events.on('npc_kill', 'bh_kill_check', () => {}); // placeholder
  // We hook into the PvP death section in server.js via events
  events.on('player_death', 'bh_death_check', (data) => {
    const { player: p, ws, killer } = data;
    if (!killer || !killer.id) return; // Only player killers
    // Check if killer had BH target = dead player
    for (const [w, pl] of players) {
      if (pl.bhTarget === p.id) {
        pl.bhKills = (pl.bhKills || 0) + 1;
        p.bhDeaths = (p.bhDeaths || 0) + 1;
        // Award BH emblem
        invAdd(pl, 920, 'BH emblem (tier 1)', 1);
        sendText(w, `Bounty Hunter kill! +1 BH emblem. BH Kills: ${pl.bhKills}`);
        pl.bhTarget = null;
        p.bhTarget = null;
        break;
      }
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ACHIEVEMENT DIARY
  // ══════════════════════════════════════════════════════════════════════════
  const ACHIEVEMENT_DIARIES = {
    lumbridge: {
      name: 'Lumbridge', tier: 'Easy',
      tasks: {
        chop_tree: { desc: 'Chop a tree', skill: 'woodcutting' },
        mine_copper: { desc: 'Mine copper ore', skill: 'mining' },
        catch_shrimp: { desc: 'Catch shrimps', skill: 'fishing' },
        kill_goblin: { desc: 'Kill a goblin', target: 'goblin' },
      },
      reward: { name: '10% more XP in Lumbridge', xpBonus: 0.1, area: 'fields' },
    },
    varrock: {
      name: 'Varrock', tier: 'Medium',
      tasks: {
        mine_iron: { desc: 'Mine iron ore', skill: 'mining', itemId: 212 },
        smith_bars: { desc: 'Smith a bar at the furnace', skill: 'smithing' },
        kill_guard: { desc: 'Kill a guard', target: 'guard' },
        complete_quest: { desc: 'Complete any quest', type: 'quest' },
      },
      reward: { name: '10% more XP in Town', xpBonus: 0.1, area: 'town' },
    },
  };

  commands.register('diary', { help: 'Achievement diaries: diary, diary [region]', category: 'General',
    fn: (p, args) => {
      if (!p.diaryProgress) p.diaryProgress = {};
      if (!p.diaryComplete) p.diaryComplete = {};
      if (!p.diaryRewards) p.diaryRewards = {};

      const region = args.join(' ').toLowerCase();
      if (!region) {
        let out = '── Achievement Diaries ──\n';
        for (const [id, diary] of Object.entries(ACHIEVEMENT_DIARIES)) {
          const complete = p.diaryComplete[id] || false;
          const taskCount = Object.keys(diary.tasks).length;
          const doneCount = p.diaryProgress[id] ? Object.keys(p.diaryProgress[id]).filter(k => p.diaryProgress[id][k]).length : 0;
          out += `  ${complete ? '[DONE]' : `[${doneCount}/${taskCount}]`} ${diary.name} (${diary.tier}) — ${diary.reward.name}\n`;
        }
        out += '\nType `diary [region]` for details.';
        return out;
      }

      const diary = ACHIEVEMENT_DIARIES[region];
      if (!diary) return `Unknown diary: "${region}". Available: ${Object.keys(ACHIEVEMENT_DIARIES).join(', ')}`;
      if (!p.diaryProgress[region]) p.diaryProgress[region] = {};

      let out = `── ${diary.name} Diary (${diary.tier}) ──\n`;
      for (const [taskId, task] of Object.entries(diary.tasks)) {
        const done = p.diaryProgress[region][taskId] || false;
        out += `  ${done ? '[X]' : '[ ]'} ${task.desc}\n`;
      }
      out += `\nReward: ${diary.reward.name}`;
      if (p.diaryComplete[region]) out += ' (CLAIMED)';
      else {
        const allDone = Object.keys(diary.tasks).every(k => p.diaryProgress[region][k]);
        if (allDone && !p.diaryComplete[region]) {
          p.diaryComplete[region] = true;
          p.diaryRewards[region] = true;
          out += '\n\nAll tasks complete! Reward activated!';
        }
      }
      return out;
    }
  });

  // Track diary tasks via events
  events.on('npc_kill', 'diary_kill_track', (data) => {
    const { player: p, npc } = data;
    if (!p.diaryProgress) p.diaryProgress = {};
    const npcName = npc.name.toLowerCase();
    for (const [diaryId, diary] of Object.entries(ACHIEVEMENT_DIARIES)) {
      if (!p.diaryProgress[diaryId]) p.diaryProgress[diaryId] = {};
      for (const [taskId, task] of Object.entries(diary.tasks)) {
        if (task.target && task.target === npcName && !p.diaryProgress[diaryId][taskId]) {
          p.diaryProgress[diaryId][taskId] = true;
          for (const [w, pl] of players) {
            if (pl === p) { sendText(w, `Diary task complete: ${task.desc} (${diary.name})`); break; }
          }
        }
      }
    }
  });

  events.on('skill_action', 'diary_skill_track', (data) => {
    const { player: p, skill } = data;
    if (!p.diaryProgress) p.diaryProgress = {};
    for (const [diaryId, diary] of Object.entries(ACHIEVEMENT_DIARIES)) {
      if (!p.diaryProgress[diaryId]) p.diaryProgress[diaryId] = {};
      for (const [taskId, task] of Object.entries(diary.tasks)) {
        if (task.skill && task.skill === skill && !p.diaryProgress[diaryId][taskId]) {
          p.diaryProgress[diaryId][taskId] = true;
          for (const [w, pl] of players) {
            if (pl === p) { sendText(w, `Diary task complete: ${task.desc} (${diary.name})`); break; }
          }
        }
      }
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 9. RUNECRAFTING PROPER
  // ══════════════════════════════════════════════════════════════════════════
  const RC_ALTARS = {
    air_altar: { runeId: 270, runeName: 'Air rune', level: 1, xp: 5, multiLevels: [1, 11, 22, 33, 44, 55, 66, 77, 88, 99] },
    water_altar: { runeId: 271, runeName: 'Water rune', level: 5, xp: 6, multiLevels: [5, 19, 38, 57, 76, 95] },
    earth_altar: { runeId: 272, runeName: 'Earth rune', level: 9, xp: 6.5, multiLevels: [9, 26, 52, 78] },
    fire_altar: { runeId: 273, runeName: 'Fire rune', level: 14, xp: 7, multiLevels: [14, 35, 70] },
  };

  commands.register('craftrunes', { help: 'Craft runes at an altar: craftrunes', aliases: ['craft runes'], category: 'Skills',
    fn: (p) => {
      // Find nearby altar
      let foundAltar = null;
      const altarNames = { air_altar: 'Air altar', water_altar: 'Water altar', earth_altar: 'Earth altar', fire_altar: 'Fire altar' };
      for (const [defId, name] of Object.entries(altarNames)) {
        const obj = objects.findObjectByName(name, p.x, p.y, 3, p.layer);
        if (obj) { foundAltar = { defId: obj.defId, ...RC_ALTARS[defId] }; break; }
      }
      if (!foundAltar) return 'You need to be near a runecrafting altar.';
      if (getLevel(p, 'runecrafting') < foundAltar.level) return `You need Runecrafting level ${foundAltar.level}.`;
      const essenceCount = invCount(p, 710);
      if (essenceCount === 0) return 'You have no rune essence.';

      // Calculate multiplier
      const rcLevel = getLevel(p, 'runecrafting');
      let multi = 1;
      for (const lvl of foundAltar.multiLevels) {
        if (rcLevel >= lvl) multi++;
      }
      multi = Math.max(1, multi - 1); // First entry is base level

      const runesPerEssence = multi;
      const totalRunes = essenceCount * runesPerEssence;
      invRemove(p, 710, essenceCount);
      invAdd(p, foundAltar.runeId, foundAltar.runeName, totalRunes, true);
      const xp = foundAltar.xp * essenceCount;
      const lvl = addXp(p, 'runecrafting', xp);
      updateWeight(p);
      let msg = `You craft ${totalRunes} ${foundAltar.runeName}s from ${essenceCount} essence. (${runesPerEssence}x per essence)${xpDrop('runecrafting', xp)}`;
      if (lvl) msg += levelUpMsg('runecrafting', lvl);
      events.emit('skill_action', { player: p, skill: 'runecrafting' });
      return msg;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 10. STAIRS / LAYER TRANSITIONS
  // ══════════════════════════════════════════════════════════════════════════
  commands.register('climbup', { help: 'Climb up stairs', aliases: ['climb up'], category: 'Navigation',
    fn: (p) => {
      const stairNames = ['Staircase', 'Staircase up'];
      let found = null;
      for (const name of stairNames) {
        found = objects.findObjectByName(name, p.x, p.y, 2, p.layer);
        if (found) break;
      }
      if (!found) return 'There are no stairs nearby to climb up.';
      p.layer += 1;
      p.path = [];
      const area = tiles.getArea(p.x, p.y, p.layer);
      return `You climb up the stairs to layer ${p.layer}.${area ? ' Area: ' + area.name : ''}`;
    }
  });

  commands.register('climbdown', { help: 'Climb down stairs', aliases: ['climb down'], category: 'Navigation',
    fn: (p) => {
      const stairNamesDown = ['Staircase', 'Staircase down'];
      let found = null;
      for (const name of stairNamesDown) {
        found = objects.findObjectByName(name, p.x, p.y, 2, p.layer);
        if (found) break;
      }
      if (!found) return 'There are no stairs nearby to climb down.';
      p.layer -= 1;
      p.path = [];
      const area = tiles.getArea(p.x, p.y, p.layer);
      return `You climb down the stairs to layer ${p.layer}.${area ? ' Area: ' + area.name : ''}`;
    }
  });

  // Override the existing 'climb' alias to handle 'climb up' and 'climb down' naturally
  const existingClimb = commands.commands.get('climb');
  if (existingClimb) {
    const origClimbFn = existingClimb.fn;
    existingClimb.fn = (p, args, raw) => {
      const sub = args.join(' ').toLowerCase();
      if (sub === 'up' || sub.startsWith('up')) {
        return commands.execute(p, 'climbup');
      }
      if (sub === 'down' || sub.startsWith('down')) {
        return commands.execute(p, 'climbdown');
      }
      return origClimbFn(p, args, raw);
    };
  }
};
