// ══════════════════════════════════════════════════════════════════════════════
// FAIRY RINGS: Every fairy ring code and destination
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const FAIRY_RINGS = [
  { code: 'AIQ', dest: 'Mudskipper Point' },
  { code: 'AIR', dest: 'Islands south of Witchaven' },
  { code: 'AIS', dest: 'Feldip Hunter area' },
  { code: 'AJQ', dest: 'Cave south of Dorgesh-Kaan' },
  { code: 'AJR', dest: 'Slayer cave' },
  { code: 'AJS', dest: 'Penguins near Miscellania' },
  { code: 'AKQ', dest: 'Piscatoris Hunter area' },
  { code: 'AKS', dest: 'Feldip Hills jungle' },
  { code: 'ALP', dest: 'Lighthouse' },
  { code: 'ALQ', dest: 'Haunted Woods east' },
  { code: 'ALR', dest: 'Abyssal Nexus' },
  { code: 'ALS', dest: 'Sorcerer Tower' },
  { code: 'BIP', dest: 'Islands SW of Mort Myre' },
  { code: 'BIQ', dest: 'Kalphite Lair' },
  { code: 'BIS', dest: 'Ardougne Zoo' },
  { code: 'BJR', dest: 'Fisher Realm' },
  { code: 'BJS', dest: 'Island near Zul-Andra' },
  { code: 'BKP', dest: 'South of Castle Wars' },
  { code: 'BKQ', dest: 'Enchanted Valley' },
  { code: 'BKR', dest: 'Morytania swamp SE' },
  { code: 'BLP', dest: 'TzHaar area' },
  { code: 'BLR', dest: 'Legends Guild area' },
  { code: 'CIP', dest: 'Miscellania' },
  { code: 'CIQ', dest: 'NW of Yanille' },
  { code: 'CIR', dest: 'South of Mount Karuulm' },
  { code: 'CIS', dest: 'North of Arceuus Library' },
  { code: 'CJR', dest: 'Sinclair Mansion' },
  { code: 'CKP', dest: 'Cosmic altar' },
  { code: 'CKR', dest: 'South of Tai Bwo Wannai' },
  { code: 'CKS', dest: 'Canifis' },
  { code: 'CLP', dest: 'Draynor Manor' },
  { code: 'CLR', dest: 'Ape Atoll' },
  { code: 'CLS', dest: 'Hazelmere island' },
  { code: 'DIP', dest: 'Abyssal Nexus' },
  { code: 'DIQ', dest: 'Player-owned house portal' },
  { code: 'DIR', dest: 'Gorak Plane' },
  { code: 'DIS', dest: 'Wizards Tower' },
  { code: 'DJP', dest: 'Tower of Life' },
  { code: 'DJR', dest: 'Chasm of Fire' },
  { code: 'DKP', dest: 'Karambwan fishing' },
  { code: 'DKR', dest: 'Edgeville' },
  { code: 'DKS', dest: 'Snowy Hunter area / Dagannoth Kings' },
  { code: 'DLQ', dest: 'North of Nardah' },
  { code: 'DLR', dest: 'Islands south of Mos Le Harmless' },
  { code: 'DLS', dest: 'Myreque Hideout' },
];

for (const f of FAIRY_RINGS) {
  define({
    id: `fairy-${f.code.toLowerCase()}`, name: `Fairy Ring ${f.code}: ${f.dest}`, type: 'transport',
    atoms: { cooldown: { duration: 3 } },
    config: { code: f.code, dest: f.dest, method: 'fairy_ring' }
  });
}

console.log(`[defs] Fairy Rings: ${FAIRY_RINGS.length} codes`);
