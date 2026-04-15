// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Item Blitz 3 (burn v2 / monsters-mega)
// Fresh items to fill gaps in the 110-monster mega drop tables.
// ID range: 66000-66500 (verified free at write time)
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../../data/items');
const d = (id, name, examine, value, category, opts = {}) =>
  items.define({ id, name, examine, value, category, ...opts });

// ── HEARTLANDS gap items ─────────────────────────────────────────────────────
d(66001, 'Hedgerow pelt', 'Bristly fur from a hedgerow beast.', 35, 'crafting');
d(66002, 'Farm pest stinger', 'Coated with a mild irritant.', 12, 'crafting');
d(66003, 'Militia insignia', 'A cheap brass badge.', 40, 'misc');
d(66004, 'Thatch charm', 'A small straw-woven luck charm.', 25, 'misc');
d(66005, 'Harrowroot', 'Bitter root from the plough-line.', 18, 'food');
d(66006, 'Tinker lockpick', 'Lets you pick a few chest locks.', 80, 'tool');

// ── MORYSKAH gap items ───────────────────────────────────────────────────────
d(66020, 'Grave-spawn ichor', 'Black ooze from a pit-born thing.', 55, 'crafting');
d(66021, 'Werewolf claw', 'A thick curved claw. Still warm.', 180, 'crafting');
d(66022, 'Salt vampire fang', 'Pitted with brine. Rare.', 400, 'crafting');
d(66023, 'Grave ribbon', 'A mourner\'s ribbon, ink-stained.', 30, 'misc');
d(66024, 'Blood-silver coin', 'Moryskah mint. Still warm.', 120, 'misc');
d(66025, 'Coffin splinter', 'From a very old lid.', 8, 'crafting');
d(66026, 'Nocturne lace', 'Black lace, vampire-fashionable.', 60, 'misc');
d(66027, 'Cursed signet', 'A family seal, ruined.', 250, 'misc');
d(66028, 'Chapel ash', 'Ash from a sanctified pyre.', 45, 'crafting');

// ── BONEYARD gap items ───────────────────────────────────────────────────────
d(66040, 'Mummy wrap strip', 'Preserved linen. Smells of spice.', 28, 'crafting');
d(66041, 'Scarab carapace', 'Iridescent beetle shell.', 45, 'crafting');
d(66042, 'Salt-stalker hide', 'Leathery, crusted with rime.', 90, 'crafting');
d(66043, 'Dust-dweller tooth', 'A long flat fang, sand-worn.', 55, 'crafting');
d(66044, 'Pharaoh\'s seal', 'A name-glyph from a forgotten king.', 600, 'misc');
d(66045, 'Crypt charcoal', 'Charred pitch. Burns hot.', 20, 'crafting');
d(66046, 'Desert agate', 'A cut agate. Sells well.', 140, 'gem');

// ── VEILWOOD gap items ───────────────────────────────────────────────────────
d(66060, 'Mirror-deer antler', 'Antler that reflects nothing.', 200, 'crafting');
d(66061, 'Glass-spider silk', 'Crystal thread. Cuts as you wind it.', 95, 'crafting');
d(66062, 'Corrupted acorn', 'An acorn with teeth.', 40, 'crafting');
d(66063, 'Moonglass shard', 'Moonlight, solidified.', 175, 'crafting');
d(66064, 'Veil heartwood', 'Wood with a slow pulse.', 260, 'crafting');
d(66065, 'Fey-wrought locket', 'Holds a song instead of a face.', 320, 'misc');

// ── SOOTWORKS gap items ──────────────────────────────────────────────────────
d(66080, 'Rust flake', 'Corroded iron dust.', 5, 'crafting');
d(66081, 'Clockwork spring', 'A tight coil, still wound.', 38, 'crafting');
d(66082, 'Forge-wraith essence', 'Captured heat in a bottle.', 160, 'crafting');
d(66083, 'Rust-golem core', 'A cracked magnetite heart.', 420, 'crafting');
d(66084, 'Soot-smothered cog', 'A cog caked in greasy soot.', 22, 'crafting');
d(66085, 'Oiled linkage', 'Still slides smoothly.', 48, 'crafting');

// ── SALTBRINE gap items ──────────────────────────────────────────────────────
d(66100, 'Brine troll tusk', 'A yellowed tusk. Heavy.', 150, 'crafting');
d(66101, 'Kraken-spawn beak', 'A small, razored chitin beak.', 210, 'crafting');
d(66102, 'Drowner lantern', 'Flickers even underwater.', 340, 'crafting');
d(66103, 'Pickled heart', 'Still beating. Do not eat.', 90, 'misc');
d(66104, 'Salt-vampire ichor', 'Crystallised blood.', 260, 'crafting');
d(66105, 'Wreck-nail', 'A nail pulled from a sunk ship.', 14, 'crafting');

// ── INKWEALD gap items ───────────────────────────────────────────────────────
d(66120, 'Page-spawn leaf', 'A torn page that still whispers.', 60, 'crafting');
d(66121, 'Ink-shaped heart', 'A heart of wet ink. Beats slower when read.', 280, 'crafting');
d(66122, 'Forgotten-name token', 'A syllable carved in bone.', 410, 'misc');
d(66123, 'Mirror-stalker fragment', 'A shard that shows other rooms.', 190, 'crafting');
d(66124, 'Marginalia scrap', 'A scribbled warning in the edges.', 36, 'misc');
d(66125, 'Chapter-bone', 'A rib marked with a chapter number.', 130, 'crafting');

// ── GLASS DESERT gap items ───────────────────────────────────────────────────
d(66140, 'Prism tooth', 'A crystalline fang. Refracts light.', 220, 'crafting');
d(66141, 'Lens-cat eye', 'A feline eye, perfectly round.', 380, 'gem');
d(66142, 'Crystal hunter pelt', 'Fur of spun glass. Sharp.', 260, 'crafting');
d(66143, 'Sunburst sand', 'Sand that glows a day after sunset.', 65, 'crafting');
d(66144, 'Mirage ribbon', 'Curls like a thing half-seen.', 145, 'misc');

// ── WILDS gap items ──────────────────────────────────────────────────────────
d(66160, 'Revenant ether', 'A bottle of bound wilderness wind.', 540, 'crafting');
d(66161, 'Chaos-touched core', 'A pulsating heart of raw chaos.', 920, 'crafting');
d(66162, 'Demon hoof', 'A cloven hoof. Still steaming.', 160, 'crafting');
d(66163, 'Wilds trophy plate', 'A carved plate. Names of dead PKers.', 300, 'misc');
d(66164, 'Corrupted emblem', 'An emblem soaked in chaos.', 680, 'misc');
d(66165, 'Forsaken relic', 'A holy relic, long abandoned.', 1400, 'misc');
d(66166, 'Black stone', 'A shard of the Wilds themselves.', 2200, 'crafting');

// ── UNIVERSAL collection-log uniques (mega) ──────────────────────────────────
d(66200, 'Mega drop token', 'Proof of a very rare kill. Collection log.', 0, 'misc');
d(66201, 'Hedgelord pin', '(u) Heartlands mega pin. Rare.', 5000, 'misc');
d(66202, 'Grave lord talisman', '(u) Moryskah mega talisman. Rare.', 15000, 'misc');
d(66203, 'Pharaoh scarab', '(u) Boneyard mega scarab. Rare.', 22000, 'misc');
d(66204, 'Veil king circlet', '(u) Veilwood mega circlet. Rare.', 30000, 'misc');
d(66205, 'Sootlord ingot', '(u) Sootworks mega ingot. Rare.', 28000, 'misc');
d(66206, 'Brine crown', '(u) Saltbrine mega crown. Rare.', 32000, 'misc');
d(66207, 'Bound chapter', '(u) Inkweald mega chapter. Rare.', 35000, 'misc');
d(66208, 'Crystal crown', '(u) Glass Desert mega crown. Rare.', 40000, 'misc');
d(66209, 'Wilds warlord skull', '(u) Wilds mega skull. Rare.', 50000, 'misc');

console.log('[aelgard] items-blitz3 (mega drop-gap items) loaded');
