// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Quirky World Interactions
//
// "The Draynor pump gives a tiny amount of strength XP per click. Nobody
//  designed it as a training method — it's flavor. But if you're locked to
//  a region with no other strength option, you pump for 40 hours." — The design brief
//
// Ambient world objects that grant tiny, discoverable, mathematically-terrible
// amounts of XP. These are lifelines for area-locked accounts. They make the
// content feel ALIVE rather than gamey — interactions exist because the world
// has textures, not because someone designed a training method.
//
// Each interaction is:
//   - Always available (no cooldown, no daily limit)
//   - Very slow XP rate (0.1 - 2 XP per click)
//   - Flavorful (fits the region's theme)
//   - Sometimes the ONLY way to train a skill in that region
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rel = require('../../data/relationships');

// ── The Quirky Interactions Registry ──────────────────────────────────────────
// Not part of the relationship engine — this is a standalone registry since
// these aren't real training methods, they're world flavor that grants XP.

const quirkyInteractions = new Map();

function defineQuirky(id, opts) {
  quirkyInteractions.set(id, {
    id,
    name: opts.name,
    region: opts.region,
    location: opts.location || '',
    skill: opts.skill,
    xpPerClick: opts.xpPerClick,
    clicksPerHour: opts.clicksPerHour || 3600,  // default: 1 click per second
    attention: opts.attention || 'medium',       // most are annoying high-attention
    description: opts.description || '',
    requires: opts.requires || {},                // { item, skill_level, quest }
    flavor: opts.flavor || '',
    discoverability: opts.discoverability || 'hidden', // 'obvious', 'hidden', 'very_hidden'
  });
}

function getQuirky(id) { return quirkyInteractions.get(id); }
function listQuirkyForRegion(region) {
  return [...quirkyInteractions.values()].filter(q => q.region === region);
}
function listQuirkyForSkill(skill) {
  return [...quirkyInteractions.values()].filter(q => q.skill === skill);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEARTLANDS QUIRKY INTERACTIONS
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('heartlands_draynor_pump', {
  name: 'The Village Pump',
  region: 'heartlands',
  location: 'Heartlands village square',
  skill: 'strength',
  xpPerClick: 0.3,
  clicksPerHour: 2400,
  attention: 'high',
  description: 'Pump handle at the village well. Each pump gives the slightest strength XP.',
  flavor: 'Old Grigg leans against the well, watching you. "Thirsty work, eh?"',
  discoverability: 'hidden',
});

defineQuirky('heartlands_practice_dummy', {
  name: 'Guard Practice Dummy',
  region: 'heartlands',
  location: 'Heartlands barracks',
  skill: 'attack',
  xpPerClick: 1,
  clicksPerHour: 1800,
  attention: 'high',
  description: 'Swing at the practice dummy. Each hit gives minimal attack XP.',
  requires: { item: 'any_weapon' },
  flavor: 'The guards laugh at your form. The dummy doesnt complain.',
  discoverability: 'obvious',
});

defineQuirky('heartlands_chapel_polish', {
  name: 'Polish the Altar',
  region: 'heartlands',
  location: 'Heartlands chapel',
  skill: 'prayer',
  xpPerClick: 0.5,
  clicksPerHour: 1200,
  attention: 'medium',
  description: 'Rub the altar with a cloth. Monks appreciate the dedication.',
  requires: { item: 'polish_rag' },
  flavor: 'Father Dorin nods approvingly each time you polish.',
  discoverability: 'hidden',
});

defineQuirky('heartlands_market_chisel', {
  name: 'Masonry Wall Chiseling',
  region: 'heartlands',
  location: 'Heartlands market masonry',
  skill: 'crafting',
  xpPerClick: 0.5,
  clicksPerHour: 3000,
  attention: 'high',
  description: 'Chisel decorative patterns into the market wall. Never makes it look better.',
  requires: { item: 'chisel' },
  flavor: 'The mason will let you practice all day. "Wont hurt the wall — already ugly."',
  discoverability: 'very_hidden',
});

defineQuirky('heartlands_bakery_stir', {
  name: 'Stir the Dough',
  region: 'heartlands',
  location: 'Heartlands bakery',
  skill: 'cooking',
  xpPerClick: 0.4,
  clicksPerHour: 2400,
  attention: 'medium',
  description: 'Stir the bakers dough. They let you help if you dont eat any.',
  flavor: 'The smell is incredible. Your stomach growls.',
  discoverability: 'obvious',
});

// ══════════════════════════════════════════════════════════════════════════════
// BONEYARD WASTES QUIRKY INTERACTIONS
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('boneyard_sand_sifter', {
  name: 'Sift the Dig Site Sand',
  region: 'boneyard_wastes',
  location: 'Boneyard dig site',
  skill: 'thieving',
  xpPerClick: 0.8,
  clicksPerHour: 1800,
  attention: 'medium',
  description: 'Sift sand for tiny artifacts. Most are worthless but you learn stealth.',
  flavor: 'The archaeologist ignores you but leaves the sand pile accessible.',
  discoverability: 'hidden',
});

defineQuirky('boneyard_mummy_wraps', {
  name: 'Re-wrap the Mummy Display',
  region: 'boneyard_wastes',
  location: 'Boneyard museum',
  skill: 'crafting',
  xpPerClick: 0.3,
  clicksPerHour: 1500,
  attention: 'medium',
  description: 'Carefully re-wrap a display mummy. Minimal crafting XP.',
  requires: { item: 'clean_cloth' },
  flavor: 'The curator supervises. "NOT too tight."',
  discoverability: 'very_hidden',
});

defineQuirky('boneyard_ember_poke', {
  name: 'Poke the Desert Fire Pit',
  region: 'boneyard_wastes',
  location: 'Boneyard traveler fire',
  skill: 'firemaking',
  xpPerClick: 0.4,
  clicksPerHour: 1200,
  attention: 'low',
  description: 'Stir the embers. Keeps the fire alive for desert nights.',
  flavor: 'The traveler nods. "Firemaking is a practiced art, stranger."',
  discoverability: 'obvious',
});

// ══════════════════════════════════════════════════════════════════════════════
// VEILWOOD QUIRKY INTERACTIONS
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('veilwood_druid_chant', {
  name: 'Chant with the Druids',
  region: 'veilwood',
  location: 'Veilwood druid circle',
  skill: 'prayer',
  xpPerClick: 1.2,
  clicksPerHour: 800,
  attention: 'medium',
  description: 'Join the druids low chant. Repeat the syllables they teach you.',
  requires: { quest: 'the_green_thumb' },
  flavor: 'You dont understand the words. The druids smile anyway.',
  discoverability: 'hidden',
});

defineQuirky('veilwood_trim_vines', {
  name: 'Trim the Sacred Vines',
  region: 'veilwood',
  location: 'Veilwood grove',
  skill: 'farming',
  xpPerClick: 0.6,
  clicksPerHour: 2000,
  attention: 'medium',
  description: 'Prune overgrown vines. The druids appreciate the help.',
  requires: { item: 'secateurs' },
  flavor: 'The vines seem to grow back the moment you look away.',
  discoverability: 'hidden',
});

defineQuirky('veilwood_target_practice', {
  name: 'Elven Archery Targets',
  region: 'veilwood',
  location: 'Veilwood archery range',
  skill: 'ranged',
  xpPerClick: 2,
  clicksPerHour: 900,
  attention: 'high',
  description: 'Practice on the elven target range. They mock your aim.',
  requires: { item: 'any_bow' },
  flavor: '"Your technique is... primitive," the elf says.',
  discoverability: 'obvious',
});

defineQuirky('veilwood_moonpool_scry', {
  name: 'Scry at the Moonpool',
  region: 'veilwood',
  location: 'Veilwood moonpool',
  skill: 'magic',
  xpPerClick: 1.5,
  clicksPerHour: 600,
  attention: 'medium',
  description: 'Stare into the moonlit pool. Visions grant magic insight.',
  flavor: 'Brief, flickering images. A war. A throne. A broken crystal.',
  discoverability: 'very_hidden',
});

// ══════════════════════════════════════════════════════════════════════════════
// SOOTWORKS QUIRKY INTERACTIONS
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('sootworks_pressure_lever', {
  name: 'Pull the Pressure Lever',
  region: 'sootworks',
  location: 'Sootworks boiler room',
  skill: 'strength',
  xpPerClick: 0.7,
  clicksPerHour: 2000,
  attention: 'high',
  description: 'Pull the massive pressure-release lever. Heavy. Unsatisfying.',
  flavor: 'A dwarf grunts approval. "Keep pullin. Keeps the place from blowin up."',
  discoverability: 'obvious',
});

defineQuirky('sootworks_bellows_pump', {
  name: 'Pump the Bellows',
  region: 'sootworks',
  location: 'Sootworks forge',
  skill: 'smithing',
  xpPerClick: 0.8,
  clicksPerHour: 2400,
  attention: 'high',
  description: 'Pump the forge bellows. Apprentice work, but smithing XP trickles in.',
  flavor: 'The blacksmith tolerates you. "Youre not in the way, at least."',
  discoverability: 'obvious',
});

defineQuirky('sootworks_pipe_tightening', {
  name: 'Tighten the Steam Pipes',
  region: 'sootworks',
  location: 'Sootworks steam district',
  skill: 'crafting',
  xpPerClick: 0.6,
  clicksPerHour: 1800,
  attention: 'medium',
  description: 'Tighten the endless steam pipe joints. They always leak.',
  requires: { item: 'wrench' },
  flavor: 'The pipes hiss at you passively. Mocking.',
  discoverability: 'hidden',
});

defineQuirky('sootworks_oil_lamp_trim', {
  name: 'Trim the Factory Lamps',
  region: 'sootworks',
  location: 'Sootworks tunnels',
  skill: 'firemaking',
  xpPerClick: 0.3,
  clicksPerHour: 1800,
  attention: 'low',
  description: 'Trim the wicks on the dim factory lamps. Light gets slightly better.',
  flavor: 'No one notices. Somehow still rewarding.',
  discoverability: 'very_hidden',
});

// ══════════════════════════════════════════════════════════════════════════════
// MORYSKAH QUIRKY INTERACTIONS
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('moryskah_bog_stir', {
  name: 'Stir the Bog Witchs Cauldron',
  region: 'moryskah',
  location: 'Bog Witchs hut',
  skill: 'cooking',
  xpPerClick: 0.5,
  clicksPerHour: 1200,
  attention: 'medium',
  description: 'Stir the endless cauldron. The stew never finishes cooking.',
  requires: { quest: 'the_bog_witchs_errand' },
  flavor: 'The Bog Witch hums while you stir. "Faster, slower, faster. Never stop."',
  discoverability: 'hidden',
});

defineQuirky('moryskah_crypt_rubbing', {
  name: 'Make Crypt Rubbings',
  region: 'moryskah',
  location: 'Moryskah graveyard',
  skill: 'crafting',
  xpPerClick: 0.4,
  clicksPerHour: 1500,
  attention: 'medium',
  description: 'Press paper to tombstones and rub with charcoal. Etchings reveal old names.',
  requires: { item: 'charcoal' },
  flavor: 'Some of the names feel familiar somehow. You havent been here before.',
  discoverability: 'very_hidden',
});

defineQuirky('moryskah_exorcism_chant', {
  name: 'Practice Exorcism Chant',
  region: 'moryskah',
  location: 'Moryskah chapel ruins',
  skill: 'prayer',
  xpPerClick: 1.0,
  clicksPerHour: 900,
  attention: 'medium',
  description: 'Recite the ancient exorcism phrases. Nothing happens. Probably.',
  flavor: 'The chapel grows slightly darker each time. Probably just your eyes.',
  discoverability: 'hidden',
});

defineQuirky('moryskah_bat_feeding', {
  name: 'Feed the Bat Colony',
  region: 'moryskah',
  location: 'Moryskah bat cave',
  skill: 'hunter',
  xpPerClick: 0.8,
  clicksPerHour: 1500,
  attention: 'medium',
  description: 'Toss scraps to the cave bats. They know you now.',
  requires: { item: 'bat_food' },
  flavor: 'The bats no longer swarm you. Progress.',
  discoverability: 'very_hidden',
});

// ══════════════════════════════════════════════════════════════════════════════
// INKWEALD QUIRKY INTERACTIONS
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('inkweald_dream_meditation', {
  name: 'Meditate on a Lucid Stone',
  region: 'inkweald',
  location: 'Inkweald lucid glade',
  skill: 'magic',
  xpPerClick: 1.2,
  clicksPerHour: 600,
  attention: 'low',
  description: 'Sit and meditate on a lucid stone. Gradual magic understanding.',
  flavor: 'The stone is warm. The world feels thinner here.',
  discoverability: 'hidden',
});

defineQuirky('inkweald_mirror_gaze', {
  name: 'Gaze into the Mirror Pool',
  region: 'inkweald',
  location: 'Inkweald mirror pool',
  skill: 'prayer',
  xpPerClick: 0.8,
  clicksPerHour: 700,
  attention: 'medium',
  description: 'Look into your reflection. It looks back slightly wrong.',
  flavor: 'Your reflection smiles first this time.',
  discoverability: 'very_hidden',
});

defineQuirky('inkweald_butterfly_observe', {
  name: 'Observe the Dream Butterflies',
  region: 'inkweald',
  location: 'Inkweald butterfly meadow',
  skill: 'hunter',
  xpPerClick: 0.3,
  clicksPerHour: 2400,
  attention: 'low',
  description: 'Watch the impossible butterflies. Study their paths.',
  flavor: 'You take mental notes. The butterflies seem aware of this.',
  discoverability: 'hidden',
});

// ══════════════════════════════════════════════════════════════════════════════
// SALTBRINE REACH QUIRKY INTERACTIONS
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('saltbrine_rope_climbing', {
  name: 'Climb the Rigging',
  region: 'saltbrine_reach',
  location: 'Saltbrine harbour',
  skill: 'agility',
  xpPerClick: 1.5,
  clicksPerHour: 900,
  attention: 'medium',
  description: 'Climb the ship rigging. Sailors laugh if you slip.',
  flavor: '"You climb like a landlubber," the captain says, smirking.',
  discoverability: 'obvious',
});

defineQuirky('saltbrine_knot_tying', {
  name: 'Practice Knot Tying',
  region: 'saltbrine_reach',
  location: 'Saltbrine dock',
  skill: 'crafting',
  xpPerClick: 0.5,
  clicksPerHour: 1800,
  attention: 'medium',
  description: 'Tie and untie sailor knots. The veterans critique your form.',
  requires: { item: 'rope' },
  flavor: '"Thats a granny knot, not a bowline. Try again."',
  discoverability: 'hidden',
});

defineQuirky('saltbrine_pearl_cleaning', {
  name: 'Clean Pearls for the Jeweller',
  region: 'saltbrine_reach',
  location: 'Saltbrine pearl shop',
  skill: 'crafting',
  xpPerClick: 0.7,
  clicksPerHour: 1200,
  attention: 'medium',
  description: 'Polish raw pearls. The jeweller pays you nothing but you learn the craft.',
  requires: { item: 'polishing_cloth' },
  flavor: 'She watches your technique. "Not bad. Keep at it."',
  discoverability: 'hidden',
});

defineQuirky('saltbrine_seagull_stare', {
  name: 'Stare Down the Seagulls',
  region: 'saltbrine_reach',
  location: 'Saltbrine boardwalk',
  skill: 'hunter',
  xpPerClick: 0.2,
  clicksPerHour: 3000,
  attention: 'low',
  description: 'Stare intently at seagulls. They stare back. Hunter XP somehow.',
  flavor: 'This is somehow the most flavorful content in Aelgard.',
  discoverability: 'very_hidden',
});

// ══════════════════════════════════════════════════════════════════════════════
// GLASS DESERT QUIRKY INTERACTIONS
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('glass_desert_wind_chime', {
  name: 'Tune the Crystal Wind Chimes',
  region: 'glass_desert',
  location: 'Glass Desert sage camp',
  skill: 'crafting',
  xpPerClick: 1.0,
  clicksPerHour: 800,
  attention: 'medium',
  description: 'Adjust the resonance of the crystal chimes. The sage listens critically.',
  flavor: 'The sage smiles when you hit the right tone. Rare occurrence.',
  discoverability: 'very_hidden',
});

defineQuirky('glass_desert_prism_polish', {
  name: 'Polish the Sun Prisms',
  region: 'glass_desert',
  location: 'Glass Desert prism shrine',
  skill: 'prayer',
  xpPerClick: 1.5,
  clicksPerHour: 600,
  attention: 'medium',
  description: 'Polish the great prisms. They redirect sunlight for the shrine.',
  requires: { item: 'prism_cloth' },
  flavor: 'Light catches and throws rainbows across your face.',
  discoverability: 'hidden',
});

// ══════════════════════════════════════════════════════════════════════════════
// THE WILDS QUIRKY INTERACTIONS (dangerous flavor)
// ══════════════════════════════════════════════════════════════════════════════

defineQuirky('wilds_fallen_statue_climb', {
  name: 'Climb the Fallen Statue',
  region: 'the_wilds',
  location: 'Wilds ruins',
  skill: 'agility',
  xpPerClick: 2.0,
  clicksPerHour: 500,
  attention: 'high',
  description: 'Climb the ancient fallen statue. PvP-enabled while you do.',
  flavor: 'The statue is massive. Climbing it exposes you to any PKer in the zone.',
  discoverability: 'very_hidden',
});

defineQuirky('wilds_revenant_ward', {
  name: 'Place a Revenant Ward',
  region: 'the_wilds',
  location: 'Wilds revenant cave entrance',
  skill: 'prayer',
  xpPerClick: 1.8,
  clicksPerHour: 400,
  attention: 'medium',
  description: 'Stake a holy ward into the ground. Slight prayer XP per ward.',
  requires: { item: 'blessed_stake' },
  flavor: 'You hope no revenants notice. Or PKers. Mostly PKers.',
  discoverability: 'hidden',
});

// ══════════════════════════════════════════════════════════════════════════════
// ALSO REGISTER THESE AS "TRAINING METHODS" WITH TINY XP RATES
// So the progression sim and region analyzer can see them as lifelines.
// ══════════════════════════════════════════════════════════════════════════════

for (const [id, q] of quirkyInteractions) {
  try {
    rel.defineTrainingMethod(`quirky_${id}`, {
      skill: q.skill,
      name: `[Quirky] ${q.name}`,
      levelRange: [1, 99],
      xpPerHour: Math.round(q.xpPerClick * q.clicksPerHour),
      prerequisites: {
        skills: q.requires.skill_level || {},
        quests: q.requires.quest ? [q.requires.quest] : [],
        items: q.requires.item ? [{ name: q.requires.item }] : [],
        areas: [q.region],
      },
      resourceOutput: { produces: [], net: 'neutral' },
      bankingFrequency: 'never',
      costPerHour: 0,
      danger: q.region === 'the_wilds' ? 'extreme' : 'none',
      complexity: 'trivial',
      attention: q.attention,
      inputs: [],
      description: q.description,
      location: q.region === 'heartlands' ? 'Heartlands' :
                q.region === 'boneyard_wastes' ? 'Boneyard Wastes' :
                q.region === 'veilwood' ? 'Veilwood' :
                q.region === 'sootworks' ? 'Sootworks' :
                q.region === 'moryskah' ? 'Moryskah' :
                q.region === 'inkweald' ? 'Inkweald' :
                q.region === 'saltbrine_reach' ? 'Saltbrine Reach' :
                q.region === 'glass_desert' ? 'Glass Desert' :
                q.region === 'the_wilds' ? 'The Wilds' : q.region,
    });
  } catch (e) {
    // Training method may already exist or validation may fail — ignore
  }
}

console.log(`[aelgard] Quirky interactions loaded: ${quirkyInteractions.size} world objects across all 9 regions`);

module.exports = {
  getQuirky,
  listQuirkyForRegion,
  listQuirkyForSkill,
  all: () => [...quirkyInteractions.values()],
};
