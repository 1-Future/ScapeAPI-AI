// ══════════════════════════════════════════════════════════════════════════════
// _niche_power_bestiary.js — adds class_tags field to every bestiary monster
// across data/bestiary/*.json. Infers tags from:
//   - examine text keywords
//   - weakness / attack_style
//   - region / habitat context
//   - slayer_level_required / combat_level
//
// Valid class_tag vocabulary:
//   demon, boss, undead, dragon, magic_user, kalphite, vampyre, slayer,
//   beast, human, armoured, elemental, construct, plant, goblinoid, shade,
//   shadow, giant, ranged_user
//
// Writes data/bestiary/*.json in-place with class_tags on every monster.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const BESTIARY_DIR = path.join(__dirname, '..', 'data', 'bestiary');

// Text keyword -> class_tag. Matching uses word-boundary anchors so we don't
// false-positive on "servant" = kalphite or "giant" = kalphite. Keywords in
// the *name* are weighted higher than in examine/habitat, which itself is
// weighted higher than bible prose (bible contains so much flavour it was
// triggering most tags on most monsters). The bible is used only for the
// strongest keywords (dragon, demon, vampyre, kalphite).
function inferClassTags(m, region) {
  const tags = new Set();
  const lower = (s) => String(s || '').toLowerCase();
  const name = lower(m.name);
  const examine = lower(m.examine);
  const bible = Array.isArray(m.bible) ? m.bible.map(lower).join(' ') : '';
  const habitat = lower(m.habitat);
  // name+examine+habitat are authoritative. Bible excluded by default to avoid
  // prose-keyword bleed.
  const text = `${name} ${examine} ${habitat}`;
  const textWide = `${text} ${bible}`;

  // Helper — test against primary text
  const has = (re) => re.test(text);
  const hasWide = (re) => re.test(textWide);

  // demon — name/examine match only (avoid bible prose bleed)
  if (has(/\bdemon|\bimp\b|\binfernal\b|hellhound|\babyssal\b|tzhaar|tzrek|kril|bloodveld|nechry/)) tags.add('demon');

  // undead — name/examine
  // "tomb" alone is a location, not a tag — use "tomb-wraith/spawn/spectre".
  // "Tomb robber" is a human thief, not undead.
  if (has(/\bundead\b|\bskeleton|\bskeletal\b|\bzombie|\bghoul|\blich\b|\bwraith\b|\bghost\b|\bmummy\b|\bghast\b|\bbarrow|\brevenant|\bbanshee|\bcrypt\b|\btomb[\s-]?(?:spawn|wraith|spectre|shade|guardian)|\bgrave[\s-]?spawn|\brisen\b|\bbone[\s-]?(?:dragon|warrior|servant|guard|scarab|shade|king|lord)|\bfunerary|\bmortuary|\bsun[\s-]?king/)) tags.add('undead');

  // dragon / wyvern / drake — primary text
  if (has(/\bdragon|\bwyrm\b|\bwyvern|\bdrake\b|\bhydra\b|\bhatchling/)) tags.add('dragon');

  // kalphite — require word-boundaries + strict match, not substring
  if (has(/\bkalphite\b|\bscarab\b|\bkhepri\b|\bhive[\s-]?(queen|soldier|worker|guardian)/)) tags.add('kalphite');

  // vampyre / juvinate / blood lord
  if (has(/\bvampyre\b|\bvampire\b|\bjuvinate\b|\bjuvenate\b|\bnosferatu|\bblood[\s-]?(?:lord|priest|count|servant)|\bstrigoi\b/)) tags.add('vampyre');

  // magic_user — combat style or name contains mage/cast words
  if (m.attack_style === 'magic' ||
      has(/\bmage\b|\bsorcer|\bwarlock|\bwitch\b|\bhexen\b|\bchanter\b|\bincanter\b|\bnecromancer|\bwizard\b|\bconjur|\boracle\b|\benchanter|\bspellwright|\bscholar\b/)) {
    tags.add('magic_user');
  }

  // ranged_user
  if (m.attack_style === 'ranged' ||
      has(/\barcher\b|\branger\b|\bcrossbow|\bshooter\b|\bgunner\b|\bskirmisher\b|\bslinger\b|\bhighwayman\b/)) {
    tags.add('ranged_user');
  }

  // human — explicit human roles; gated so undead/shade are not double-tagged
  const humanRe = /\bbandit\b|\bbrigand\b|\bsoldier\b|\bguard\b|\bcaptain\b|\bknight\b|\bpirate\b|\boutlaw\b|\bthief\b|\bassassin\b|\bmercenary\b|\bwarden\b|\bmonk\b|\bpriest\b|\bpriestess\b|\bdruid\b|\bsailor\b|\bmarauder\b|\bnomad\b|\btribesman\b|\bnoble\b|\bchampion\b|\bgladiator\b|\bfarmer\b|\bfarmhand\b|\bmilitia\b|\bcultist\b|\bcult\b|\brogue\b|\btomb[\s-]?robber/;
  if (has(humanRe) && !has(/\bundead\b|\bghost\b|\bghoul\b|\bskeleton|\bzombie\b|\bwraith\b|\bmummy\b|\blich\b|\bshade\b|\brisen\b|\bspectre\b/)) {
    tags.add('human');
  }

  // giant — name match only
  if (has(/\bgiant\b|\bogre\b|\btroll\b|\bcyclops\b|\bcolossus\b|\bbehemoth\b|\btitan\b/)) tags.add('giant');

  // beast — name/examine only (habitat words like "badger" in bible over-trigger)
  if (has(/\brat\b|\bwolf\b|\bboar\b|\bbear\b|\bcrocodile\b|\bhorror\b|\bspider\b|\bstalker\b|\bscorpion\b|\bhound\b|\bcat\b|\bfox\b|\blizard\b|\bsnake\b|\bserpent\b|\bfrog\b|\bshark\b|\bkraken\b|\boyster\b|\btentacle\b|\bslug\b|\bworm\b|\bhedgerow\s*stalker|\bhedge[\s-]?boar|\bmarsh\s*ratler|\bcorn\s*rat|\bgoat\b|\bjackal\b|\beagle\b|\braven\b|\bcrab\b|\bmogre\b|\blurker\b|\btoad\b/)) {
    tags.add('beast');
  }

  // plant — name only (bible has "wood", "bark", "thorn" everywhere)
  if (has(/\btreant\b|\bent\b|\bvine\b|\bsapling\b|\bmandrake\b|\bspriggan\b|\bbloom\b|\bfungus\b|\bfungal\b|\bspore\b|\bmoss[\s-]?(knight|warrior)|\bliving[\s-]?vine\b|\bmushroom\b|\bbark[\s-]?(golem|hound|beast)|\broot[\s-]?(warrior|horror|stalker)/)) {
    tags.add('plant');
  }

  // construct — gargoyle, golem, automaton
  if (has(/\bgolem\b|\bconstruct\b|\bautomat|\bgargoyle\b|\bmechan|\bclockwork\b|\bstatue\b|\banimated/)) tags.add('construct');

  // elemental — strict set of elemental archetypes
  if (has(/\belemental\b|\bfire[\s-]?(?:giant|imp|sprite|wisp|drake|serpent)|\bice[\s-]?(?:giant|warrior|spirit)|\bmagma[\s-]?(?:serpent|drake|beast)|\blava[\s-]?(?:beast|drake)|\btempest[\s-]?(?:spirit)|\bstorm[\s-]?(?:spirit|elemental)|\bfrost[\s-]?(?:spirit|wraith)|\bsand[\s-]?(?:wraith|genie)/)) {
    tags.add('elemental');
  }

  // shadow / umbra / nightmare
  if (has(/\bshade\b|\bshadow\b|\bshadowhide|\bumbra\b|\beclipse\b|\bnightstalker|\bgloom|\bnightmare/)) tags.add('shadow');

  // goblinoid
  if (has(/\bgoblin\b|\bhobgoblin|\borc\b|\bgnoll\b|\bkobold/)) tags.add('goblinoid');

  // armoured — strict armor-carrying archetypes
  if (has(/\barmou?red\b|\bplate\b|\bfortress|\bcarapace\b|\bchitin\b|\bchurch[\s-]?gargoyle|\bturtle\b|\bscarab\b|\bcrab\b/)) tags.add('armoured');

  // slayer — slayer_level_required > 0 OR slayer_xp > 0
  if (Number(m.slayer_level_required) > 0 || Number(m.slayer_xp) > 0) tags.add('slayer');

  // boss — combat_level high or name-hint
  const combatLevel = Number(m.combat_level || m.combat || 0);
  if (combatLevel >= 300
      || (combatLevel >= 180 && has(/\bboss\b|\boverlord\b|\bwarden\b|\bpatriarch\b|\bmatriarch\b|\barchon\b|\bavatar\b|\btyrant\b|\bancient[\s-]?(?:one|lord)/))) {
    tags.add('boss');
  }

  // Bible-augment: add dragon/demon/vampyre/kalphite only if bible strongly implies
  // (scroll-level detail that name/examine missed)
  if (!tags.has('dragon') && hasWide(/\bdragon[\s-]?kin\b|\bwyrmling|\bchromatic\b.*\bdragon/)) tags.add('dragon');
  if (!tags.has('vampyre') && hasWide(/\bblood[\s-]?drinker|\bfang[\s-]?mark|\bbleeds\s+the\s+living/)) tags.add('vampyre');

  // Fallback — every monster must have at least one tag
  if (tags.size === 0) {
    if (m.attack_style === 'magic') tags.add('magic_user');
    else if (m.attack_style === 'ranged') tags.add('ranged_user');
    else tags.add('beast');
  }

  return [...tags];
}

function main() {
  const files = fs.readdirSync(BESTIARY_DIR).filter(f => f.endsWith('.json'));
  let totalMonsters = 0;
  let totalTags = 0;
  const tagHistogram = {};
  for (const f of files) {
    const full = path.join(BESTIARY_DIR, f);
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    const region = data._region || f.replace('.json', '');
    const monsters = data.monsters || [];
    for (const m of monsters) {
      const tags = inferClassTags(m, region);
      m.class_tags = tags;
      totalMonsters++;
      totalTags += tags.length;
      for (const t of tags) tagHistogram[t] = (tagHistogram[t] || 0) + 1;
    }
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n');
    console.log(`[niche-bestiary] ${f}: tagged ${monsters.length} monsters`);
  }
  console.log(`[niche-bestiary] ${totalMonsters} monsters tagged with ${totalTags} class_tags total (avg ${(totalTags / totalMonsters).toFixed(2)})`);
  console.log(`[niche-bestiary] tag histogram: ${JSON.stringify(tagHistogram)}`);
}

main();
