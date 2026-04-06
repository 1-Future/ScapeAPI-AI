// ══════════════════════════════════════════════════════════════════════════════
// MUSIC TRACKS: Every region-unlockable music track
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// Major region tracks (there are ~600 total, defining notable ones)
const TRACKS = [
  // Lumbridge/Draynor
  'Newbie Melody', 'Harmony', 'Flute Salad', 'Autumn Voyage', 'Dream',
  'Book of Spells', 'Medieval', 'Garden', 'Expander', 'Start',
  // Varrock
  'Adventure', 'Spirit', 'Parade', 'Scape Main', 'Scape Cave',
  'Doorways', 'Long Way Home', 'The Trade Parade', 'Still Night',
  // Falador
  'Fanfare', 'Nightfall', 'Workshop', 'Wander', 'Artistry',
  'Knights of the Round Table', 'Princely Pleasures',
  // Wilderness
  'Dark', 'Wilderness', 'Dangerous Way', 'Ice Melody', 'Regal',
  'Wild Side', 'Deep Wilderness', 'Forsaken',
  // Karamja
  'Sea Shanty', 'Sea Shanty 2', 'Jolly-R', 'High Seas', 'Tropical Island',
  // Morytania
  'Undead Dungeon', 'Spooky', 'Creepy', 'Haunted', 'Temple of Tribes',
  'Darkly Altar', 'In the Manor', 'Bloodvelds Lullaby',
  // Tirannwn
  'Waterfall', 'Overture', 'Crystal Cave', 'Crystal Sword',
  // Kourend
  'Kingdom', 'Preservation', 'Righteousness', 'The Forlorn Homestead',
  // Desert
  'Arabian', 'Arabian 2', 'Arabian 3', 'Dunes of Eternity',
  // God Wars
  'Armadyl Alliance', 'Zamorak Zoo', 'Bandos Battalion', 'Saradomin Strings',
  // Raids
  'Chambers of Xeric', 'Maiden of Sugadinti', 'Siren\'s Song', 'Verzik\'s Theme',
  // Bosses
  'Inferno Theme', 'TzTok-Jad', 'Mor Ul Rek', 'Zulrah', 'Vorkath',
  'The Nightmare', 'Corporeal Beast', 'Kalphite Queen',
  // Special
  'Login Screen', 'Scape Bold', 'Scape Santa', 'Barbarianism',
  'Goblin Village', 'Gnome King', 'Temple', 'Upcoming',
  // Newer
  'Tombs of Amascut', 'The Leviathan', 'Duke Sucellus', 'Vardorvis',
  'The Whisperer', 'Fortis Colosseum', 'Echoes of the Ancients',
];

let count = 0;
for (const track of TRACKS) {
  const id = `music-${track.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
  define({
    id, name: `Track: ${track}`, type: 'music',
    atoms: {},
    config: { track }
  });
  count++;
}

console.log(`[defs] Music: ${count} tracks`);
