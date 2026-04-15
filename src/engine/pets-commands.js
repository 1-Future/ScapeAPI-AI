// ══════════════════════════════════════════════════════════════════════════════
// Pet Companion — Chat Commands
//
// Installs the `/pet` command family via the central command registry. Usage
// from server bootstrap (follows the pattern of ironman-commands.js):
//
//   const petsCommands = require('./engine/pets-commands');
//   petsCommands.register({
//     commands,       // src/engine/commands.js
//     pets,           // src/engine/pets.js
//   });
//
// Commands installed:
//   /pet list                       — all unlocked pets
//   /pet summon <id|name>           — summon a pet (one active at a time)
//   /pet dismiss                    — despawn the active pet
//   /pet feed <food item>           — feed the active pet
//   /pet rename <id|name> <newname> — nickname an unlocked pet
//   /pet insured <id|name> [on|off] — toggle hardcore insurance
//   /pet affinity [id|name]         — show affinity for one or all pets
//   /pet help                       — print this help
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

function usage() {
  return [
    'Usage:',
    '  pet list                         all unlocked pets',
    '  pet summon <id|name>             summon a pet (one active at a time)',
    '  pet dismiss                      despawn the active pet',
    '  pet feed <food>                  feed the active pet',
    '  pet rename <id|name> <newname>   nickname an unlocked pet',
    '  pet insured <id|name> [on|off]   toggle hardcore insurance',
    '  pet affinity [id|name]           show affinity values',
  ].join('\n');
}

// Resolve a pet by id (number) or partial name match. Returns { petId, def }
// or null.
function resolvePet(pets, player, needle) {
  if (needle == null || needle === '') return null;
  const asNum = Number(needle);
  if (!Number.isNaN(asNum) && pets.getPetDef(asNum)) {
    return { petId: asNum, def: pets.getPetDef(asNum) };
  }
  const lower = String(needle).toLowerCase();
  const all = pets.getPets(player);
  const byNickname = all.find(p => p.nickname && p.nickname.toLowerCase() === lower);
  if (byNickname) return { petId: byNickname.id, def: pets.getPetDef(byNickname.id) };
  const byName = all.find(p => p.name.toLowerCase() === lower);
  if (byName) return { petId: byName.id, def: pets.getPetDef(byName.id) };
  const partial = all.find(p => p.name.toLowerCase().includes(lower));
  if (partial) return { petId: partial.id, def: pets.getPetDef(partial.id) };
  return null;
}

// Resolve an item by name/id for feeding. Best-effort; server can inject its
// own items module. If not available we accept numeric ids directly.
function resolveFoodId(itemsModule, needle) {
  if (needle == null) return null;
  const asNum = Number(needle);
  if (!Number.isNaN(asNum)) return asNum;
  if (!itemsModule || typeof itemsModule.find !== 'function') return null;
  const hit = itemsModule.find(String(needle));
  return hit ? hit.id : null;
}

function register(opts) {
  const commands = opts && opts.commands;
  const pets     = opts && opts.pets;
  const itemsMod = opts && opts.items;
  if (!commands) throw new Error('pets-commands.register: commands module required');
  if (!pets)     throw new Error('pets-commands.register: pets module required');

  commands.register('pet', {
    help: 'Pet companions — list, summon, feed, rename',
    category: 'Pets',
    aliases: ['pets'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      // ── list ────────────────────────────────────────────────────────────
      if (sub === 'list' || sub === 'ls' || sub === '') {
        const all = pets.getPets(p);
        if (all.length === 0) return 'You have not unlocked any pets yet.';
        const lines = [`You have ${all.length} unlocked pet${all.length === 1 ? '' : 's'}:`];
        for (const pet of all) {
          const tag = pet.active ? '[active] ' : '';
          const shiny = pet.shiny ? ' (shiny)' : '';
          const nick = pet.nickname ? ` "${pet.nickname}"` : '';
          const ins = pet.insured ? ' [insured]' : '';
          lines.push(`  ${tag}#${pet.id} ${pet.name}${nick}${shiny} — lv${pet.level}, aff ${pet.affinity}/1000${ins}`);
        }
        return lines.join('\n');
      }

      // ── summon ──────────────────────────────────────────────────────────
      if (sub === 'summon' || sub === 'call') {
        const needle = args.slice(1).join(' ');
        if (!needle) return 'Usage: pet summon <id|name>';
        const hit = resolvePet(pets, p, needle);
        if (!hit) return `No pet matching "${needle}" in your collection.`;
        const res = pets.summonPet(p, hit.petId);
        if (!res.ok) {
          if (res.reason === 'not_unlocked') return 'You have not unlocked that pet.';
          if (res.reason === 'in_combat')    return 'Cannot summon a passive pet mid-combat.';
          return `Could not summon: ${res.reason}.`;
        }
        if (res.alreadyActive) return `${hit.def.name} is already following you.`;
        return `${hit.def.name} appears beside you.`;
      }

      // ── dismiss ─────────────────────────────────────────────────────────
      if (sub === 'dismiss' || sub === 'unsummon' || sub === 'hide') {
        const res = pets.dismissPet(p);
        if (!res.ok) return 'You have no active pet to dismiss.';
        return `${res.def ? res.def.name : 'Your pet'} vanishes.`;
      }

      // ── feed ────────────────────────────────────────────────────────────
      if (sub === 'feed') {
        const cp = pets.currentPet(p);
        if (!cp) return 'You need to summon a pet before feeding it.';
        const needle = args.slice(1).join(' ');
        if (!needle) return 'Usage: pet feed <food item>';
        const foodId = resolveFoodId(itemsMod, needle);
        if (foodId == null) return `Unknown food: ${needle}.`;
        const res = pets.feedPet(p, cp.petId, foodId);
        if (!res.ok) {
          if (res.reason === 'food_not_in_inventory') return `You have no ${needle} in your inventory.`;
          return `Could not feed: ${res.reason}.`;
        }
        const tag = res.whitelisted ? 'loves it' : 'nibbles politely';
        let msg = `${cp.name} ${tag} (+${res.amount} affinity, now ${res.value}/1000 lv${res.level}).`;
        if (res.levelUp) msg += ` Level up! Lv ${res.level}.`;
        if (res.shinyUnlocked) msg += ' Shiny variant unlocked!';
        return msg;
      }

      // ── rename ──────────────────────────────────────────────────────────
      if (sub === 'rename' || sub === 'name') {
        if (args.length < 3) return 'Usage: pet rename <id|name> <newname>';
        const hit = resolvePet(pets, p, args[1]);
        if (!hit) return `No pet matching "${args[1]}" in your collection.`;
        const newName = args.slice(2).join(' ');
        const res = pets.renamePet(p, hit.petId, newName);
        if (!res.ok) return `Rename failed: ${res.reason}.`;
        if (res.cleared) return `Cleared nickname for ${hit.def.name}.`;
        return `${hit.def.name} is now called "${res.name}".`;
      }

      // ── insured ─────────────────────────────────────────────────────────
      if (sub === 'insured' || sub === 'insure') {
        if (args.length < 2) return 'Usage: pet insured <id|name> [on|off]';
        const hit = resolvePet(pets, p, args[1]);
        if (!hit) return `No pet matching "${args[1]}" in your collection.`;
        const raw = (args[2] || 'on').toLowerCase();
        const flag = !(raw === 'off' || raw === '0' || raw === 'false' || raw === 'no');
        const res = pets.setInsured(p, hit.petId, flag);
        if (!res.ok) return `Toggle failed: ${res.reason}.`;
        return `${hit.def.name} insurance: ${res.insured ? 'ON' : 'OFF'}.`;
      }

      // ── affinity ────────────────────────────────────────────────────────
      if (sub === 'affinity' || sub === 'aff') {
        if (args.length >= 2) {
          const hit = resolvePet(pets, p, args[1]);
          if (!hit) return `No pet matching "${args[1]}" in your collection.`;
          const a = pets.getAffinity(p, hit.petId);
          if (!a) return 'No data.';
          const next = a.nextLevelAt != null ? ` (next lv at ${a.nextLevelAt})` : ' (max level)';
          return `${hit.def.name}: aff ${a.value}/1000, lv ${a.level}${next}${a.shiny ? ' shiny' : ''}`;
        }
        const all = pets.getPets(p);
        if (all.length === 0) return 'You have no pets to track.';
        const lines = ['Affinity:'];
        for (const pet of all) {
          lines.push(`  ${pet.name} — aff ${pet.affinity}/1000, lv ${pet.level}${pet.shiny ? ' shiny' : ''}`);
        }
        return lines.join('\n');
      }

      // ── help / unknown ──────────────────────────────────────────────────
      if (sub === 'help' || sub === '?') return usage();
      return `Unknown sub-command: ${sub}\n${usage()}`;
    },
  });
}

module.exports = { register, usage };
