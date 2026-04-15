// ══════════════════════════════════════════════════════════════════════════════
// Player Housing — Chat Commands
//
// Exposes the /house verb family per the BYOS spec:
//   /house enter [player]           — enter self or a friend's house
//   /house leave
//   /house create                   — unlock the house (first use)
//   /house build <room> [slot]      — build a room at slot index
//   /house destroy <slot>
//   /house furniture <slot> <id>    — place furniture on the room at slot
//   /house remove <slot> <id>
//   /house portal set <slot> <region>
//   /house party invite <playerId>  — (feast start)
//   /house party end
//   /house sleep                    — bedroom rest XP boost
//   /house redecorate <type> <arg>  — preview a change without committing
//   /house status                   — show rooms, cap, XP, portals
//
// Registers via the shared commands registry (src/engine/commands.js).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const housing = require('./housing');

function fmtHouseStatus(p, house) {
  const lvl = housing.constructionLevel(p);
  const cap = housing.roomCapForLevel(lvl);
  const roomList = house.rooms.length
    ? house.rooms.map(r => `  slot ${r.slot.idx} (${r.slot.x},${r.slot.y}): ${r.roomId} [${Object.keys(r.furniture).length} placed]`).join('\n')
    : '  (no rooms built)';
  const portals = Object.entries(house.portalDestinations || {});
  const portalList = portals.length
    ? portals.map(([s, r]) => `  ${s} -> ${r}`).join('\n')
    : '  (no portals attuned)';
  return [
    'Your house:',
    `  layer:    ${house.layer}`,
    `  rooms:    ${house.rooms.length}/${cap} (Construction ${lvl})`,
    `  total XP: ${house.totalBuildXp}`,
    `  theme:    ${house.theme}`,
    '',
    'Rooms:',
    roomList,
    '',
    'Portals:',
    portalList,
  ].join('\n');
}

function parseSlotArg(arg) {
  if (arg == null) return null;
  // Accept "3" or "2,1" for grid coords.
  const s = String(arg);
  if (s.includes(',')) {
    const [x, y] = s.split(',').map(Number);
    if (Number.isInteger(x) && Number.isInteger(y)) return { x, y };
    return null;
  }
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}

function register(opts) {
  opts = opts || {};
  const commands = opts.commands || require('./commands');

  commands.register('house', {
    category: 'Housing',
    help: 'Player housing: /house create | enter | leave | build <room> <slot> | furniture <slot> <id> | portal set <slot> <region> | party invite <id> | sleep | redecorate | status',
    fn: (player, args) => {
      const sub = (args && args[0] ? String(args[0]) : '').toLowerCase();

      // ── create ─────────────────────────────────────────────────────────────
      if (sub === 'create' || sub === 'buy') {
        const r = housing.createHouse(player);
        if (!r.ok) return `Cannot create house: ${r.reason}`;
        return `House created. Instance layer ${r.house.layer}. Use /house build <room> <slot> to start.`;
      }

      // ── enter ──────────────────────────────────────────────────────────────
      if (sub === 'enter') {
        const target = args[1] ? args[1] : null;
        const r = housing.enterHouse(player, target);
        if (!r.ok) return `Cannot enter house: ${r.reason}`;
        return `You enter the house. Layer ${r.layer}, ${r.house.rooms.length} rooms.`;
      }

      // ── leave ──────────────────────────────────────────────────────────────
      if (sub === 'leave' || sub === 'exit') {
        const r = housing.leaveHouse(player);
        if (!r.ok) return `Cannot leave: ${r.reason}`;
        return 'You step outside.';
      }

      // ── build ──────────────────────────────────────────────────────────────
      if (sub === 'build') {
        const roomType = args[1] ? String(args[1]).toLowerCase() : null;
        const slot = parseSlotArg(args[2]);
        if (!roomType) return 'Usage: /house build <roomType> <slot>';
        if (slot === null) return 'Usage: /house build <roomType> <slot> (slot = 0..35 or x,y)';
        const r = housing.buildRoom(player, roomType, slot);
        if (!r.ok) return `Cannot build: ${r.reason}`;
        return `${roomType} built at slot ${r.room.slot.idx}. +${r.xp} Construction XP.`;
      }

      // ── destroy ────────────────────────────────────────────────────────────
      if (sub === 'destroy' || sub === 'remove-room') {
        const slot = parseSlotArg(args[1]);
        if (slot === null) return 'Usage: /house destroy <slot>';
        const r = housing.destroyRoom(player, slot);
        if (!r.ok) return `Cannot destroy: ${r.reason}`;
        return `Removed ${r.removed.roomId} from slot ${r.removed.slot.idx}.`;
      }

      // ── furniture ──────────────────────────────────────────────────────────
      if (sub === 'furniture') {
        const slot = parseSlotArg(args[1]);
        const id = args[2] ? String(args[2]) : null;
        if (slot === null || !id) return 'Usage: /house furniture <slot> <furnitureId>';
        const r = housing.addFurniture(player, slot, id);
        if (!r.ok) return `Cannot place: ${r.reason}`;
        return `Placed ${r.furniture.name}. +${r.xp} Construction XP.`;
      }

      // ── remove (furniture) ────────────────────────────────────────────────
      if (sub === 'remove' || sub === 'unfurnish') {
        const slot = parseSlotArg(args[1]);
        const id = args[2] ? String(args[2]) : null;
        if (slot === null || !id) return 'Usage: /house remove <slot> <furnitureId>';
        const r = housing.removeFurniture(player, slot, id);
        if (!r.ok) return `Cannot remove: ${r.reason}`;
        return `Removed ${r.removed.name}.`;
      }

      // ── portal ─────────────────────────────────────────────────────────────
      if (sub === 'portal') {
        const action = args[1] ? String(args[1]).toLowerCase() : '';
        if (action === 'set') {
          const slotName = args[2] ? String(args[2]) : null;
          const region = args[3] ? String(args[3]) : null;
          if (!slotName || !region) return 'Usage: /house portal set <portal_1|portal_2|portal_3> <region>';
          const r = housing.setPortalDestination(player, slotName, region);
          if (!r.ok) return `Cannot attune: ${r.reason}`;
          return `Portal ${slotName} now leads to ${region}.`;
        }
        if (action === 'list') {
          const portals = housing.listPortals(player);
          if (!portals.length) return 'No portals attuned.';
          return portals.map(p => `  ${p.slot} -> ${p.region}`).join('\n');
        }
        return 'Usage: /house portal set <slot> <region> | list';
      }

      // ── party (feast) ──────────────────────────────────────────────────────
      if (sub === 'party') {
        const action = args[1] ? String(args[1]).toLowerCase() : '';
        if (action === 'invite') {
          const guests = args.slice(2);
          if (!guests.length) return 'Usage: /house party invite <player> [player2] ...';
          const r = housing.startFeast(player, guests);
          if (!r.ok) return `Cannot start feast: ${r.reason}`;
          return `Feast started with ${guests.length} guest(s).`;
        }
        if (action === 'end') {
          const r = housing.endFeast(player);
          if (!r.ok) return `Cannot end feast: ${r.reason}`;
          return 'Feast ended.';
        }
        return 'Usage: /house party invite <player> | end';
      }

      // ── sleep (bedroom) ────────────────────────────────────────────────────
      if (sub === 'sleep' || sub === 'rest') {
        const r = housing.sleep(player);
        if (!r.ok) return `Cannot sleep: ${r.reason}`;
        return 'You rest. +25% XP boost for 10 minutes.';
      }

      // ── redecorate (preview) ───────────────────────────────────────────────
      if (sub === 'redecorate' || sub === 'preview') {
        const kind = args[1] ? String(args[1]).toLowerCase() : null;
        if (!kind) return 'Usage: /house redecorate room <type> | furniture <id>';
        let change = null;
        if (kind === 'room') change = { type: 'buildRoom', roomType: args[2] };
        else if (kind === 'furniture') change = { type: 'addFurniture', furnitureId: args[2] };
        const r = housing.previewChange(player, change);
        if (!r.ok) return `Cannot preview: ${r.reason}`;
        const lines = [
          `Current Construction: ${r.currentLevel}`,
          `Current rooms: ${r.currentRooms}/${r.cap}`,
        ];
        if (r.projectedXp != null) lines.push(`Projected XP: +${r.projectedXp}`);
        if (r.levelOk === false) lines.push('Warning: level too low.');
        if (r.capOk === false) lines.push('Warning: would exceed room cap.');
        return lines.join('\n');
      }

      // ── status ─────────────────────────────────────────────────────────────
      if (sub === 'status' || sub === '' || sub === undefined || sub === 'info') {
        const h = housing.getHouse(player);
        if (!h) return 'You have no house. Use /house create (requires Construction 10).';
        return fmtHouseStatus(player, h);
      }

      return 'Usage: /house create | enter | leave | build <room> <slot> | furniture <slot> <id> | portal set <slot> <region> | party invite <id> | sleep | redecorate | status';
    },
  });
}

module.exports = { register };
