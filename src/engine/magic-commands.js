// ══════════════════════════════════════════════════════════════════════════════
// Magic — Chat Commands
//
// Installs /cast, /spellbook, /enchant, /alch via the central command registry
// without touching src/commands/all.js.
//
// Register from the server bootstrap:
//
//   const magicCommands = require('./engine/magic-commands');
//   magicCommands.register({ commands, magicRunner });
//
// Commands installed:
//   /cast <spell> [target]        cast a spell
//   /spellbook <book>             switch spellbook (standard|ancient|lunar|dream)
//   /enchant <jewellery>          enchant jewellery (auto-picks tier)
//   /alch <item> [hi|lo]          alchemize an item
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

function usage() {
  return [
    'Usage:',
    '  cast <spell_id> [target]        cast a spell (e.g. cast ice_barrage)',
    '  spellbook <standard|ancient|lunar|dream>',
    '  enchant <itemId>                enchant jewellery in your inventory',
    '  alch <itemId> [hi|lo]           alchemize (default: hi)',
  ].join('\n');
}

function normaliseId(raw) {
  return (raw || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function register(opts) {
  const commands    = opts && opts.commands;
  const magicRunner = (opts && opts.magicRunner) || require('./magic-runner');
  const findPlayer  = (opts && opts.findPlayer) || null;
  if (!commands) throw new Error('magic-commands.register: commands module required');

  // /cast <spell> [target]
  commands.register('cast', {
    help: 'Cast a spell: cast <spell_id> [target]',
    category: 'Combat',
    fn: (p, args) => {
      if (!args.length) return usage();
      const spellId = normaliseId(args[0]);
      let target = null;
      if (args[1] && findPlayer) target = findPlayer(args[1]);

      const res = magicRunner.cast(p, spellId, target);
      if (!res.ok) return res.reason;
      const out = res.result || {};
      if (out.kind === 'teleport') return `You teleport to ${out.target}.`;
      if (out.kind === 'combat')   return `You cast ${res.spell.name}. Max hit ${out.maxHit}.`;
      if (out.kind === 'enchant')  return `You cast ${res.spell.name}. Hand it an item to enchant.`;
      if (out.kind === 'humidify') return 'Humidified all empty water containers.';
      if (out.kind === 'dream')    return 'You fall into a healing dream.';
      if (out.kind === 'vengeance')return 'Vengeance will trigger on next melee hit taken.';
      if (out.kind === 'cure')     return 'Cure spell completed.';
      if (out.kind === 'heal_other') return `Transferred ${out.transfer} HP.`;
      if (out.kind === 'stat_spy') return 'You see their stats:\n' + Object.entries(out.snapshot || {}).map(([k,v])=>`  ${k}:${v}`).join('\n');
      if (out.kind === 'npc_contact') return 'NPC contact established.';
      return `You cast ${res.spell.name}.`;
    },
  });

  // /spellbook <book>
  commands.register('spellbook', {
    help: 'Switch spellbook: spellbook <standard|ancient|lunar|dream>',
    category: 'Combat',
    fn: (p, args) => {
      const book = (args[0] || '').toLowerCase();
      if (!book) return `Current spellbook: ${magicRunner.currentBook(p)}\nAvailable: ${magicRunner.getSpellbooks().join(', ')}`;
      const res = magicRunner.setSpellbook(p, book);
      if (!res.ok) return res.reason;
      return `Spellbook switched to ${res.book}.`;
    },
  });

  // /enchant <itemId>
  commands.register('enchant', {
    help: 'Enchant jewellery: enchant <itemId>',
    category: 'Combat',
    fn: (p, args) => {
      if (!args.length) return usage();
      const itemId = parseInt(args[0], 10);
      if (isNaN(itemId)) return 'enchant expects a numeric itemId.';
      // Pick tier based on player magic level — try highest castable
      const tiers = ['enchant_onyx', 'enchant_dragonstone', 'enchant_diamond', 'enchant_ruby', 'enchant_emerald', 'enchant_sapphire'];
      for (const spellId of tiers) {
        const chk = magicRunner.castable(p, spellId);
        if (chk.ok) {
          const res = magicRunner.enchant(p, spellId, itemId);
          if (res.ok) return `You enchant (tier ${res.tier}) item ${itemId}.`;
          return res.reason;
        }
      }
      return 'You cannot cast any enchantment spell.';
    },
  });

  // /alch <itemId> [hi|lo]
  commands.register('alch', {
    help: 'Alchemize an item: alch <itemId> [hi|lo]',
    category: 'Combat',
    fn: (p, args) => {
      if (!args.length) return usage();
      const itemId = parseInt(args[0], 10);
      if (isNaN(itemId)) return 'alch expects a numeric itemId.';
      const mode = (args[1] || 'hi').toLowerCase();
      const res = magicRunner.alch(p, itemId, mode);
      if (!res.ok) return res.reason;
      return `Alchemized item ${itemId} for ${res.coins} coins (${res.mode}).`;
    },
  });
}

module.exports = { register, usage };
